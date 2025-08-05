import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus } from '../types';
import { ClipboardDocumentListIcon, UsersIcon, TruckIcon, UserCircleIcon, WrenchScrewdriverIcon } from '../components/Icons';

// Calendar Icon
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
    </svg>
);

// Clock Icon
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const JobCardDetail = () => {
    const { jobCardId } = useParams<{ jobCardId: string }>();
    const { state, dispatch } = useAppContext();

    const jobCard = state.jobCards.find(j => j.id === jobCardId);

    if (!jobCard) {
        return <Navigate to="/job-cards" replace />;
    }
    
    const customer = state.customers.find(c => c.id === jobCard.customer_id);
    const vehicle = state.vehicles.find(v => v.id === jobCard.vehicle_id);
    const worker = state.workers.find(w => w.id === jobCard.assigned_to);
    
    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case JobStatus.PENDING: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case JobStatus.IN_PROGRESS: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case JobStatus.COMPLETED: return 'bg-green-500/10 text-green-400 border-green-500/30';
            case JobStatus.CANCELLED: return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-white/10 text-white/60 border-white/30';
        }
    };

    const getStatusIcon = (status: JobStatus) => {
        switch (status) {
            case JobStatus.PENDING: return '⏳';
            case JobStatus.IN_PROGRESS: return '🔧';
            case JobStatus.COMPLETED: return '✅';
            case JobStatus.CANCELLED: return '❌';
            default: return '📋';
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as JobStatus;
        const payload: { id: string; status: JobStatus; completed_date?: string } = {
            id: jobCard.id,
            status: newStatus,
        };
        if (newStatus === JobStatus.COMPLETED) {
            payload.completed_date = new Date().toISOString();
        }
        await dispatch({ type: 'UPDATE_JOB_CARD', payload });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Card */}
            <div className="card-luxury p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-gold rounded-2xl">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-black" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Job Card #{jobCard.id}</h2>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-white/60">
                                <div className="flex items-center space-x-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span>Created: {new Date(jobCard.created_at).toLocaleDateString()}</span>
                                </div>
                                {jobCard.completed_date && (
                                    <div className="flex items-center space-x-1">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>Completed: {new Date(jobCard.completed_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(jobCard.status)}`}>
                            <span>{getStatusIcon(jobCard.status)}</span>
                            <span>{jobCard.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Job Details */}
                    <div className="card-luxury p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <WrenchScrewdriverIcon className="h-6 w-6 mr-3 text-primary-500"/>
                            Job Details
                        </h3>
                        <div className="p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 mb-6">
                            <p className="text-white whitespace-pre-wrap leading-relaxed">{jobCard.description}</p>
                        </div>
                        
                        {/* Status Update */}
                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-medium text-white/80">Update Status</label>
                            <select
                                id="status"
                                value={jobCard.status}
                                onChange={handleStatusChange}
                                className="form-input w-full px-4 py-3"
                            >
                                {Object.values(JobStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Parts Used */}
                    {jobCard.parts_used.length > 0 && (
                        <div className="card-luxury p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Parts Used</h3>
                            <div className="space-y-3">
                                {jobCard.parts_used.map((part, index) => {
                                    const inventoryItem = state.inventory.find(i => i.id === part.itemId);
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                            <div>
                                                <p className="font-medium text-white">{inventoryItem?.name || 'Unknown Part'}</p>
                                                <p className="text-sm text-white/60">SKU: {inventoryItem?.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary-400">Qty: {part.quantity}</p>
                                                <p className="text-sm text-white/60">₹{((inventoryItem?.price || 0) * part.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Labor Information */}
                    <div className="card-luxury p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Labor Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 text-center">
                                <p className="text-sm text-white/70">Hours Worked</p>
                                <p className="text-2xl font-bold text-primary-400">{jobCard.labor_hours}h</p>
                            </div>
                            <div className="p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 text-center">
                                <p className="text-sm text-white/70">Estimated Cost</p>
                                <p className="text-2xl font-bold text-primary-400">₹{(jobCard.labor_hours * 500).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <div className="card-luxury p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <UsersIcon className="h-5 w-5 mr-2 text-primary-500" />
                            Customer
                        </h3>
                        {customer ? (
                            <Link to={`/customers/${customer.id}`} className="group block">
                                <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10 group-hover:border-primary-500/30 transition-all duration-300">
                                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{customer.name}</p>
                                        <p className="text-sm text-white/60">{customer.phone}</p>
                                        <p className="text-sm text-white/60">{customer.email}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <p className="text-white/60">No customer assigned</p>
                        )}
                    </div>

                    {/* Vehicle Card */}
                    <div className="card-luxury p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <TruckIcon className="h-5 w-5 mr-2 text-primary-500" />
                            Vehicle
                        </h3>
                        {vehicle ? (
                            <div className="p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                        <TruckIcon className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                        <p className="text-sm text-white/60">Plate: {vehicle.license_plate}</p>
                                        {vehicle.vin && <p className="text-sm text-white/60">VIN: {vehicle.vin}</p>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/60">No vehicle assigned</p>
                        )}
                    </div>

                    {/* Assigned Worker Card */}
                    <div className="card-luxury p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <UserCircleIcon className="h-5 w-5 mr-2 text-primary-500" />
                            Assigned Mechanic
                        </h3>
                        {worker ? (
                            <div className="p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black">
                                        {worker.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{worker.name}</p>
                                        <p className="text-sm text-primary-500">{worker.role}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/60">No worker assigned</p>
                        )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="card-luxury p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/70">Completion</span>
                                <span className="font-semibold text-white">
                                    {jobCard.status === JobStatus.PENDING && '0%'}
                                    {jobCard.status === JobStatus.IN_PROGRESS && '50%'}
                                    {jobCard.status === JobStatus.COMPLETED && '100%'}
                                    {jobCard.status === JobStatus.CANCELLED && 'Cancelled'}
                                </span>
                            </div>
                            <div className="w-full bg-dark-100/50 rounded-full h-3">
                                <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                        jobCard.status === JobStatus.PENDING ? 'w-0 bg-yellow-500' :
                                        jobCard.status === JobStatus.IN_PROGRESS ? 'w-1/2 bg-blue-500' :
                                        jobCard.status === JobStatus.COMPLETED ? 'w-full bg-green-500' :
                                        'w-full bg-red-500'
                                    }`}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCardDetail;