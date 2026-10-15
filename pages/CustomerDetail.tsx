import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Customer, Vehicle, CommunicationLog, ServiceHistory } from '../types';
import { PlusIcon, UsersIcon, TruckIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, PencilIcon } from '../components/Icons';

// Email Icon
const EmailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

// Phone Icon
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

// Location Icon
const LocationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

// Calendar Icon
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
    </svg>
);

// Star Icon for VIP
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const CustomerDetail = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { state, dispatch, formatCurrency } = useAppContext();

    const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
    const [isCommLogModalOpen, setCommLogModalOpen] = useState(false);
    const [isServiceHistoryModalOpen, setServiceHistoryModalOpen] = useState(false);
    const [isEditCustomerOpen, setEditCustomerOpen] = useState(false);
    const [isEditVehicleOpen, setEditVehicleOpen] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

    const initialVehicleState = { make: '', model: '', year: new Date().getFullYear(), vin: '', license_plate: '' };
    const [newVehicle, setNewVehicle] = useState(initialVehicleState);

    const initialCommLogState = { type: 'Call' as 'Call' | 'Visit' | 'Email', notes: '' };
    const [newCommLog, setNewCommLog] = useState(initialCommLogState);
    
    const initialServiceHistoryState = { description: '', cost: 0 };
    const [newServiceHistory, setNewServiceHistory] = useState(initialServiceHistoryState);

    const [editCustomerData, setEditCustomerData] = useState<Partial<Customer> | null>(null);
    const [editVehicleData, setEditVehicleData] = useState<Partial<Vehicle> | null>(null);

    const customer = state.customers.find(c => c.id === customerId);
    const vehicles = state.vehicles.filter(v => v.owner_id === customerId);

    if (!customer) {
        return <Navigate to="/customers" replace />;
    }

    const totalServiceValue = customer.service_history.reduce((sum, service) => sum + service.cost, 0);
    const lastServiceDate = customer.service_history.length > 0 
        ? Math.max(...customer.service_history.map(s => new Date(s.date).getTime()))
        : null;

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) return;
        const vehicleToAdd: Vehicle = {
            ...newVehicle,
            id: `V${Date.now()}`,
            owner_id: customerId,
            year: Number(newVehicle.year)
        };
        await dispatch({ type: 'ADD_VEHICLE', payload: vehicleToAdd });
        setVehicleModalOpen(false);
        setNewVehicle(initialVehicleState);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setEditVehicleData({ ...vehicle });
        setEditingVehicleId(vehicle.id);
        setEditVehicleOpen(true);
    };

    const handleSaveEditVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editVehicleData || !editingVehicleId) return;
        const updatedVehicle: Vehicle = {
            id: editingVehicleId,
            owner_id: editVehicleData.owner_id!,
            make: editVehicleData.make!,
            model: editVehicleData.model!,
            year: Number(editVehicleData.year),
            vin: editVehicleData.vin!,
            license_plate: editVehicleData.license_plate!,
        };
        await dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });
        setEditVehicleOpen(false);
        setEditVehicleData(null);
        setEditingVehicleId(null);
    };

    const handleEditCustomer = () => {
        setEditCustomerData({ ...customer });
        setEditCustomerOpen(true);
    };

    const handleSaveEditCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCustomerData) return;
        const updatedCustomer: Customer = {
            ...customer,
            name: editCustomerData.name || customer.name,
            phone: editCustomerData.phone || customer.phone,
            // `??` (not `||`) so an emptied field is saved as empty instead of snapping back to the old value
            email: editCustomerData.email ?? customer.email,
            address: editCustomerData.address ?? customer.address,
            coupon_id: editCustomerData.coupon_id || null,
        };
        await dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        setEditCustomerOpen(false);
        setEditCustomerData(null);
    };
    
    const handleAddCommLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        const logToAdd: CommunicationLog = {
            ...newCommLog,
            id: `COM${Date.now()}`,
            date: new Date().toISOString(),
        };
        const updatedCustomer = {
            ...customer,
            communication_log: [logToAdd, ...customer.communication_log],
        };
        await dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        setCommLogModalOpen(false);
        setNewCommLog(initialCommLogState);
    };

    const handleAddServiceHistory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        const serviceToAdd: ServiceHistory = {
            ...newServiceHistory,
            id: `SH${Date.now()}`,
            cost: Number(newServiceHistory.cost),
            date: new Date().toISOString(),
        };
        const updatedCustomer = {
            ...customer,
            service_history: [serviceToAdd, ...customer.service_history],
        };
        await dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer});
        setServiceHistoryModalOpen(false);
        setNewServiceHistory(initialServiceHistoryState);
    };

    const getCommTypeColor = (type: string) => {
        switch (type) {
            case 'Call': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            case 'Visit': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'Email': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
            default: return 'text-white/60 bg-white/10 border-white/30';
        }
    };

    const getCommTypeIcon = (type: string) => {
        switch (type) {
            case 'Call': return <PhoneIcon className="w-4 h-4" />;
            case 'Visit': return <LocationIcon className="w-4 h-4" />;
            case 'Email': return <EmailIcon className="w-4 h-4" />;
            default: return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Customer Header */}
            <div className="card-luxury p-4 sm:p-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 xl:gap-8">
                    <div className="flex items-start gap-4 min-w-0 xl:flex-1">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gradient-gold rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-black">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-white break-words min-w-0">{customer.name}</h1>
                                {customer.coupon_id && (
                                    <div className="flex items-center gap-1 px-2.5 py-0.5 flex-shrink-0 whitespace-nowrap bg-primary-500/10 border border-primary-500/30 rounded-full">
                                        <StarIcon className="w-4 h-4 text-primary-500" />
                                        <span className="text-xs font-semibold text-primary-500">VIP</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm text-white/80">
                                {customer.phone && (
                                    <div className="flex items-start gap-2">
                                        <PhoneIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                        <span className="min-w-0 break-words">{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-start gap-2">
                                        <EmailIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                        <span className="min-w-0 break-words">{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-2">
                                        <LocationIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                        <span className="min-w-0 break-words">{customer.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Stats & Edit Button */}
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:w-96 xl:flex-shrink-0">
                        <div className="flex gap-2 sm:gap-3 sm:flex-1">
                            <div className="flex-none min-w-[4.5rem] text-center px-2.5 py-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <p className="text-lg sm:text-xl font-bold text-primary-400 tabular-nums">{vehicles.length}</p>
                                <p className="text-xs text-white/60 mt-0.5">Vehicle{vehicles.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="flex-1 min-w-0 text-center px-2.5 py-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <p className="text-lg sm:text-xl font-bold text-green-400 tabular-nums break-words">{formatCurrency(totalServiceValue)}</p>
                                <p className="text-xs text-white/60 mt-0.5">Total Spent</p>
                            </div>
                            <div className="flex-none min-w-[4.5rem] text-center px-2.5 py-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <p className="text-lg sm:text-xl font-bold text-blue-400 tabular-nums">{customer.service_history.length}</p>
                                <p className="text-xs text-white/60 mt-0.5">Service{customer.service_history.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleEditCustomer}
                            className="btn-luxury w-full sm:w-auto xl:w-full sm:self-center xl:self-stretch px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                        >
                            <PencilIcon className="h-4 w-4 flex-shrink-0" />
                            <span>Edit Details</span>
                        </button>
                    </div>
                </div>

                {/* Member Since & Last Service */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-primary-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Member since {new Date(customer.created_at).toLocaleDateString()}</span>
                    </div>
                    {lastServiceDate && (
                        <div className="flex items-center gap-2">
                            <WrenchScrewdriverIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Last service: {new Date(lastServiceDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Vehicles Section */}
                <div className="card-luxury overflow-hidden flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap p-4 sm:p-6 border-b border-primary-500/10">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 min-w-0">
                            <TruckIcon className="h-5 w-5 flex-shrink-0 text-primary-500"/>
                            <span>Vehicles ({vehicles.length})</span>
                        </h3>
                        <button
                            onClick={() => setVehicleModalOpen(true)}
                            className="btn-luxury !px-3 sm:!px-4 py-2 rounded-lg flex items-center gap-2 text-sm whitespace-nowrap flex-shrink-0"
                        >
                            <PlusIcon className="h-4 w-4 flex-shrink-0 hidden sm:block" />
                            <span>Add Vehicle</span>
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex-1">
                        {vehicles.length > 0 ? (
                            <div className="space-y-3">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 hover:border-primary-500/30 transition-colors">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-gold rounded-lg flex items-center justify-center">
                                            <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm sm:text-base font-semibold text-white break-words">
                                                {vehicle.year} {vehicle.make} {vehicle.model}
                                            </h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs sm:text-sm text-white/60 mt-1">
                                                <span className="break-words">Plate: {vehicle.license_plate}</span>
                                                {vehicle.vin && <span className="whitespace-nowrap" title={vehicle.vin}>VIN: {vehicle.vin.slice(-6)}</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEditVehicle(vehicle)}
                                            aria-label="Edit vehicle"
                                            title="Edit vehicle"
                                            className="p-2.5 flex-shrink-0 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <TruckIcon className="w-10 h-10 text-primary-500/50 mx-auto mb-3" />
                                <p className="text-sm text-white/60 mb-4">No vehicles registered</p>
                                <button
                                    onClick={() => setVehicleModalOpen(true)}
                                    className="btn-secondary px-4 py-2 rounded-lg text-sm"
                                >
                                    Add First Vehicle
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service History Section */}
                <div className="card-luxury overflow-hidden flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap p-4 sm:p-6 border-b border-primary-500/10">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 min-w-0">
                            <WrenchScrewdriverIcon className="h-5 w-5 flex-shrink-0 text-primary-500"/>
                            <span>Service History ({customer.service_history.length})</span>
                        </h3>
                        <button
                            onClick={() => setServiceHistoryModalOpen(true)}
                            className="btn-luxury !px-3 sm:!px-4 py-2 rounded-lg flex items-center gap-2 text-sm whitespace-nowrap flex-shrink-0"
                        >
                            <PlusIcon className="h-4 w-4 flex-shrink-0 hidden sm:block" />
                            <span>Add Record</span>
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex-1">
                        {customer.service_history.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                                {customer.service_history.map(service => (
                                    <div key={service.id} className="flex items-start justify-between gap-3 p-3 sm:p-4 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="w-9 h-9 flex-shrink-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-medium text-white break-words">{service.description}</h4>
                                                <p className="text-xs text-white/60 mt-0.5">
                                                    {new Date(service.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="flex-shrink-0 text-right text-sm sm:text-base font-bold text-green-400 tabular-nums whitespace-nowrap">{formatCurrency(service.cost)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <WrenchScrewdriverIcon className="w-10 h-10 text-primary-500/50 mx-auto mb-3" />
                                <p className="text-sm text-white/60 mb-4">No service history</p>
                                <button
                                    onClick={() => setServiceHistoryModalOpen(true)}
                                    className="btn-secondary px-4 py-2 rounded-lg text-sm"
                                >
                                    Add First Record
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Communication Log Section */}
            <div className="card-luxury overflow-hidden">
                <div className="flex items-center justify-between gap-3 flex-wrap p-4 sm:p-6 border-b border-primary-500/10">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 min-w-0">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 flex-shrink-0 text-primary-500"/>
                        <span>Communication Log ({customer.communication_log.length})</span>
                    </h3>
                    <button
                        onClick={() => setCommLogModalOpen(true)}
                        className="btn-luxury !px-3 sm:!px-4 py-2 rounded-lg flex items-center gap-2 text-sm whitespace-nowrap flex-shrink-0"
                    >
                        <PlusIcon className="h-4 w-4 flex-shrink-0 hidden sm:block" />
                        <span>Add Log</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {customer.communication_log.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                            {customer.communication_log.map(log => (
                                <div key={log.id} className="p-3 sm:p-4 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getCommTypeColor(log.type)}`}>
                                            {getCommTypeIcon(log.type)}
                                            <span>{log.type}</span>
                                        </div>
                                        <p className="text-xs text-white/60">
                                            {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <p className="text-sm text-white leading-relaxed break-words whitespace-pre-line">{log.notes}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-8">
                            <ChatBubbleLeftRightIcon className="w-10 h-10 text-primary-500/50 mx-auto mb-3" />
                            <p className="text-sm text-white/60 mb-4">No communication logs</p>
                            <button
                                onClick={() => setCommLogModalOpen(true)}
                                className="btn-secondary px-4 py-2 rounded-lg text-sm"
                            >
                                Add First Log
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal title="Add New Vehicle" isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)}>
                <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Make *</label>
                            <input
                                type="text"
                                placeholder="Toyota, Honda, Ford..."
                                value={newVehicle.make}
                                onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Model *</label>
                            <input
                                type="text"
                                placeholder="Camry, Civic, F-150..."
                                value={newVehicle.model}
                                onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Year *</label>
                            <input
                                type="number"
                                value={newVehicle.year}
                                onChange={e => setNewVehicle({...newVehicle, year: Number(e.target.value)})}
                                className="form-input w-full px-4 py-2.5"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">License Plate *</label>
                            <input
                                type="text"
                                placeholder="ABC-1234"
                                value={newVehicle.license_plate}
                                onChange={e => setNewVehicle({...newVehicle, license_plate: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                required
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">VIN (Optional)</label>
                            <input
                                type="text"
                                placeholder="17-character VIN"
                                value={newVehicle.vin}
                                onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                maxLength={17}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setVehicleModalOpen(false)}
                            className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-luxury w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Add Vehicle
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal title="Add Communication Log" isOpen={isCommLogModalOpen} onClose={() => setCommLogModalOpen(false)}>
                <form onSubmit={handleAddCommLog} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Communication Type *</label>
                        <select
                            value={newCommLog.type}
                            onChange={e => setNewCommLog({ ...newCommLog, type: e.target.value as any })}
                            className="form-input w-full px-4 py-2.5"
                        >
                            <option value="Call">Phone Call</option>
                            <option value="Visit">In-Person Visit</option>
                            <option value="Email">Email</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Notes *</label>
                        <textarea
                            placeholder="Details about the communication..."
                            value={newCommLog.notes}
                            onChange={e => setNewCommLog({ ...newCommLog, notes: e.target.value })}
                            className="form-input w-full px-4 py-2.5 h-32 resize-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setCommLogModalOpen(false)}
                            className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-luxury w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Add Log
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal title="Add Service Record" isOpen={isServiceHistoryModalOpen} onClose={() => setServiceHistoryModalOpen(false)}>
                <form onSubmit={handleAddServiceHistory} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Service Description *</label>
                        <input
                            type="text"
                            placeholder="Oil change, brake repair, etc."
                            value={newServiceHistory.description}
                            onChange={e => setNewServiceHistory({ ...newServiceHistory, description: e.target.value })}
                            className="form-input w-full px-4 py-2.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Cost (₹) *</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={newServiceHistory.cost}
                            onChange={e => setNewServiceHistory({ ...newServiceHistory, cost: Number(e.target.value) })}
                            className="form-input w-full px-4 py-2.5"
                            required
                        />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setServiceHistoryModalOpen(false)}
                            className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-luxury w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Add Record
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal title="Edit Customer Details" isOpen={isEditCustomerOpen} onClose={() => setEditCustomerOpen(false)}>
                {editCustomerData && (
                    <form onSubmit={handleSaveEditCustomer} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={editCustomerData.name || ''}
                                    onChange={e => setEditCustomerData({...editCustomerData, name: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={editCustomerData.email || ''}
                                    onChange={e => setEditCustomerData({...editCustomerData, email: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Phone *</label>
                                <input
                                    type="tel"
                                    value={editCustomerData.phone || ''}
                                    onChange={e => setEditCustomerData({...editCustomerData, phone: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">VIP Coupon ID</label>
                                <input
                                    type="text"
                                    value={editCustomerData.coupon_id || ''}
                                    onChange={e => setEditCustomerData({...editCustomerData, coupon_id: e.target.value || undefined})}
                                    className="form-input w-full px-4 py-2.5"
                                    placeholder="Leave empty if not VIP"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Address</label>
                                <textarea
                                    value={editCustomerData.address || ''}
                                    onChange={e => setEditCustomerData({...editCustomerData, address: e.target.value})}
                                    className="form-input w-full px-4 py-2.5 h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditCustomerOpen(false)}
                                className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-luxury w-full sm:w-auto px-6 py-2.5 rounded-xl"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal title="Edit Vehicle Details" isOpen={isEditVehicleOpen} onClose={() => setEditVehicleOpen(false)}>
                {editVehicleData && (
                    <form onSubmit={handleSaveEditVehicle} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Make *</label>
                                <input
                                    type="text"
                                    placeholder="Toyota, Honda, Ford..."
                                    value={editVehicleData.make || ''}
                                    onChange={e => setEditVehicleData({...editVehicleData, make: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Model *</label>
                                <input
                                    type="text"
                                    placeholder="Camry, Civic, F-150..."
                                    value={editVehicleData.model || ''}
                                    onChange={e => setEditVehicleData({...editVehicleData, model: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Year *</label>
                                <input
                                    type="number"
                                    value={editVehicleData.year || new Date().getFullYear()}
                                    onChange={e => setEditVehicleData({...editVehicleData, year: Number(e.target.value)})}
                                    className="form-input w-full px-4 py-2.5"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">License Plate *</label>
                                <input
                                    type="text"
                                    placeholder="ABC-1234"
                                    value={editVehicleData.license_plate || ''}
                                    onChange={e => setEditVehicleData({...editVehicleData, license_plate: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-1.5">VIN (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="17-character VIN"
                                    value={editVehicleData.vin || ''}
                                    onChange={e => setEditVehicleData({...editVehicleData, vin: e.target.value})}
                                    className="form-input w-full px-4 py-2.5"
                                    maxLength={17}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditVehicleOpen(false)}
                                className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-luxury w-full sm:w-auto px-6 py-2.5 rounded-xl"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default CustomerDetail;
