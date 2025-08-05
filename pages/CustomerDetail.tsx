import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Vehicle, CommunicationLog, ServiceHistory } from '../types';
import { PlusIcon, UsersIcon, TruckIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon, WrenchScrewdriverIcon } from '../components/Icons';

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
    const { state, dispatch } = useAppContext();

    const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
    const [isCommLogModalOpen, setCommLogModalOpen] = useState(false);
    const [isServiceHistoryModalOpen, setServiceHistoryModalOpen] = useState(false);

    const initialVehicleState = { make: '', model: '', year: new Date().getFullYear(), vin: '', license_plate: '' };
    const [newVehicle, setNewVehicle] = useState(initialVehicleState);

    const initialCommLogState = { type: 'Call' as 'Call' | 'Visit' | 'Email', notes: '' };
    const [newCommLog, setNewCommLog] = useState(initialCommLogState);
    
    const initialServiceHistoryState = { description: '', cost: 0 };
    const [newServiceHistory, setNewServiceHistory] = useState(initialServiceHistoryState);

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
        <div className="space-y-8 animate-fade-in">
            {/* Customer Header */}
            <div className="card-luxury p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center text-2xl font-bold text-black">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-3xl font-bold text-white">{customer.name}</h1>
                                {customer.coupon_id && (
                                    <div className="flex items-center space-x-1 px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full">
                                        <StarIcon className="w-4 h-4 text-primary-500" />
                                        <span className="text-xs font-semibold text-primary-500">VIP</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                {customer.phone && (
                                    <div className="flex items-center space-x-2 text-white/80">
                                        <PhoneIcon className="w-4 h-4 text-primary-500" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-center space-x-2 text-white/80">
                                        <EmailIcon className="w-4 h-4 text-primary-500" />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center space-x-2 text-white/80">
                                        <LocationIcon className="w-4 h-4 text-primary-500" />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-dark-50/30 border border-primary-500/10">
                            <p className="text-2xl font-bold text-primary-400">{vehicles.length}</p>
                            <p className="text-sm text-white/60">Vehicle{vehicles.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-dark-50/30 border border-primary-500/10">
                            <p className="text-2xl font-bold text-green-400">${totalServiceValue.toLocaleString()}</p>
                            <p className="text-sm text-white/60">Total Spent</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 col-span-2 lg:col-span-1">
                            <p className="text-2xl font-bold text-blue-400">{customer.service_history.length}</p>
                            <p className="text-sm text-white/60">Service{customer.service_history.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {/* Member Since & Last Service */}
                <div className="mt-6 pt-6 border-t border-primary-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 text-white/60">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm">Member since {new Date(customer.created_at).toLocaleDateString()}</span>
                    </div>
                    {lastServiceDate && (
                        <div className="flex items-center space-x-2 text-white/60">
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                            <span className="text-sm">Last service: {new Date(lastServiceDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Vehicles Section */}
                <div className="card-luxury overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-primary-500/10">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <TruckIcon className="h-6 w-6 mr-3 text-primary-500"/>
                            Vehicles ({vehicles.length})
                        </h3>
                        <button 
                            onClick={() => setVehicleModalOpen(true)} 
                            className="btn-luxury px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Add Vehicle</span>
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {vehicles.length > 0 ? (
                            <div className="space-y-4">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 hover:border-primary-500/30 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center">
                                                <TruckIcon className="w-6 h-6 text-black" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white">
                                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-sm text-white/60 mt-1">
                                                    <span>Plate: {vehicle.license_plate}</span>
                                                    {vehicle.vin && <span>VIN: {vehicle.vin.slice(-6)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <TruckIcon className="w-12 h-12 text-primary-500/50 mx-auto mb-4" />
                                <p className="text-white/60 mb-4">No vehicles registered</p>
                                <button 
                                    onClick={() => setVehicleModalOpen(true)} 
                                    className="btn-secondary px-4 py-2 rounded-lg"
                                >
                                    Add First Vehicle
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service History Section */}
                <div className="card-luxury overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-primary-500/10">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <WrenchScrewdriverIcon className="h-6 w-6 mr-3 text-primary-500"/>
                            Service History ({customer.service_history.length})
                        </h3>
                        <button 
                            onClick={() => setServiceHistoryModalOpen(true)} 
                            className="btn-luxury px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Add Record</span>
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {customer.service_history.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                {customer.service_history.map(service => (
                                    <div key={service.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{service.description}</h4>
                                                <p className="text-sm text-white/60">
                                                    {new Date(service.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">${service.cost.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <WrenchScrewdriverIcon className="w-12 h-12 text-primary-500/50 mx-auto mb-4" />
                                <p className="text-white/60 mb-4">No service history</p>
                                <button 
                                    onClick={() => setServiceHistoryModalOpen(true)} 
                                    className="btn-secondary px-4 py-2 rounded-lg"
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
                <div className="flex justify-between items-center p-6 border-b border-primary-500/10">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3 text-primary-500"/>
                        Communication Log ({customer.communication_log.length})
                    </h3>
                    <button 
                        onClick={() => setCommLogModalOpen(true)} 
                        className="btn-luxury px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Log</span>
                    </button>
                </div>
                
                <div className="p-6">
                    {customer.communication_log.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                            {customer.communication_log.map(log => (
                                <div key={log.id} className="p-4 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <div className="flex items-start space-x-4">
                                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getCommTypeColor(log.type)}`}>
                                            {getCommTypeIcon(log.type)}
                                            <span>{log.type}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm text-white/60">
                                                    {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <p className="text-white leading-relaxed">{log.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary-500/50 mx-auto mb-4" />
                            <p className="text-white/60 mb-4">No communication logs</p>
                            <button 
                                onClick={() => setCommLogModalOpen(true)} 
                                className="btn-secondary px-4 py-2 rounded-lg"
                            >
                                Add First Log
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal title="Add New Vehicle" isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)}>
                <form onSubmit={handleAddVehicle} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Make *</label>
                            <input 
                                type="text" 
                                placeholder="Toyota, Honda, Ford..." 
                                value={newVehicle.make} 
                                onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} 
                                className="form-input w-full px-4 py-3" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Model *</label>
                            <input 
                                type="text" 
                                placeholder="Camry, Civic, F-150..." 
                                value={newVehicle.model} 
                                onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} 
                                className="form-input w-full px-4 py-3" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Year *</label>
                            <input 
                                type="number" 
                                value={newVehicle.year} 
                                onChange={e => setNewVehicle({...newVehicle, year: Number(e.target.value)})} 
                                className="form-input w-full px-4 py-3" 
                                min="1900" 
                                max={new Date().getFullYear() + 1} 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">License Plate *</label>
                            <input 
                                type="text" 
                                placeholder="ABC-1234" 
                                value={newVehicle.license_plate} 
                                onChange={e => setNewVehicle({...newVehicle, license_plate: e.target.value})} 
                                className="form-input w-full px-4 py-3" 
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">VIN (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="17-character VIN" 
                                value={newVehicle.vin} 
                                onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})} 
                                className="form-input w-full px-4 py-3" 
                                maxLength={17}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setVehicleModalOpen(false)} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            Add Vehicle
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal title="Add Communication Log" isOpen={isCommLogModalOpen} onClose={() => setCommLogModalOpen(false)}>
                <form onSubmit={handleAddCommLog} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Communication Type *</label>
                        <select 
                            value={newCommLog.type} 
                            onChange={e => setNewCommLog({ ...newCommLog, type: e.target.value as any })} 
                            className="form-input w-full px-4 py-3"
                        >
                            <option value="Call">Phone Call</option>
                            <option value="Visit">In-Person Visit</option>
                            <option value="Email">Email</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Notes *</label>
                        <textarea 
                            placeholder="Details about the communication..." 
                            value={newCommLog.notes} 
                            onChange={e => setNewCommLog({ ...newCommLog, notes: e.target.value })} 
                            className="form-input w-full px-4 py-3 h-32 resize-none" 
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setCommLogModalOpen(false)} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            Add Log
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal title="Add Service Record" isOpen={isServiceHistoryModalOpen} onClose={() => setServiceHistoryModalOpen(false)}>
                <form onSubmit={handleAddServiceHistory} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Service Description *</label>
                        <input 
                            type="text" 
                            placeholder="Oil change, brake repair, etc." 
                            value={newServiceHistory.description} 
                            onChange={e => setNewServiceHistory({ ...newServiceHistory, description: e.target.value })} 
                            className="form-input w-full px-4 py-3" 
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Cost ($) *</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01" 
                            min="0" 
                            value={newServiceHistory.cost} 
                            onChange={e => setNewServiceHistory({ ...newServiceHistory, cost: Number(e.target.value) })} 
                            className="form-input w-full px-4 py-3" 
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setServiceHistoryModalOpen(false)} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            Add Record
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(26, 26, 26, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #FFD700, #FFC107);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default CustomerDetail;