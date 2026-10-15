import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus, ServiceHistory, JobCard } from '../types';
import Modal from '../components/Modal';
import { ClipboardDocumentListIcon, UsersIcon, TruckIcon, UserCircleIcon, WrenchScrewdriverIcon, PencilIcon } from '../components/Icons';

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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState<Partial<JobCard> | null>(null);

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
            
            // Log service history for the customer, once per job: completing the same job again
            // (Completed -> In Progress -> Completed) must not add a duplicate entry.
            const alreadyLogged = customer?.service_history.some(entry => entry.job_card_id === jobCard.id);
            if (customer && !alreadyLogged) {
                const serviceEntry: ServiceHistory = {
                    id: `SH${Date.now()}`,
                    date: new Date().toISOString(),
                    description: jobCard.description,
                    cost: 0, // Cost can be set from invoice later
                    job_card_id: jobCard.id,
                };
                
                const updatedCustomer = {
                    ...customer,
                    service_history: [serviceEntry, ...customer.service_history],
                };
                
                await dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
            }
        }
        await dispatch({ type: 'UPDATE_JOB_CARD', payload });
    };

    const handleEditOpen = () => {
        setEditData({ ...jobCard });
        setIsEditOpen(true);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        
        const payload: Partial<JobCard> & { id: string } = {
            id: jobCard.id,
            description: editData.description || jobCard.description,
            labor_hours: editData.labor_hours !== undefined ? editData.labor_hours : jobCard.labor_hours,
        };
        
        await dispatch({ type: 'UPDATE_JOB_CARD', payload });
        setIsEditOpen(false);
        setEditData(null);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="card-luxury p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div className="p-2.5 bg-gradient-gold rounded-xl flex-shrink-0">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-black" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-white break-words">Job Card #{jobCard.id}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-white/60">
                                <div className="flex items-center gap-1.5">
                                    <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                                    <span>Created: {new Date(jobCard.created_at).toLocaleDateString()}</span>
                                </div>
                                {jobCard.completed_date && (
                                    <div className="flex items-center gap-1.5">
                                        <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>Completed: {new Date(jobCard.completed_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                        <div className={`inline-flex items-center gap-2 px-4 h-10 rounded-full border text-sm font-semibold whitespace-nowrap ${getStatusColor(jobCard.status)}`}>
                            <span>{getStatusIcon(jobCard.status)}</span>
                            <span>{jobCard.status}</span>
                        </div>
                        <button 
                            onClick={handleEditOpen}
                            className="inline-flex items-center justify-center gap-2 px-4 h-11 sm:h-10 rounded-lg border border-primary-500/20 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-sm font-medium whitespace-nowrap transition-colors"
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-4 sm:space-y-6 min-w-0">
                    {/* Job Details */}
                    <div className="card-luxury p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <WrenchScrewdriverIcon className="h-5 w-5 text-primary-500 flex-shrink-0"/>
                            Job Details
                        </h3>
                        <div className="p-3 sm:p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 mb-4">
                            <p className="text-sm sm:text-base text-white whitespace-pre-wrap break-words leading-relaxed">{jobCard.description}</p>
                        </div>
                        
                        {/* Status Update */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-white/80 mb-1.5">Update Status</label>
                            <select
                                id="status"
                                value={jobCard.status}
                                onChange={handleStatusChange}
                                className="form-input w-full sm:max-w-xs px-4 py-2.5"
                            >
                                {Object.values(JobStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Parts Used */}
                    {jobCard.parts_used.length > 0 && (
                        <div className="card-luxury p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Parts Used</h3>
                            <div className="space-y-3">
                                {jobCard.parts_used.map((part, index) => {
                                    const inventoryItem = state.inventory.find(i => i.id === part.itemId);
                                    return (
                                        <div key={index} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm sm:text-base font-medium text-white break-words">{inventoryItem?.name || 'Unknown Part'}</p>
                                                <p className="text-xs sm:text-sm text-white/60 break-all">SKU: {inventoryItem?.sku || '—'}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm sm:text-base font-bold text-primary-400 whitespace-nowrap tabular-nums">Qty: {part.quantity}</p>
                                                <p className="text-xs sm:text-sm text-white/60 whitespace-nowrap tabular-nums">₹{((inventoryItem?.price || 0) * part.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Labor Information */}
                    <div className="card-luxury p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Labor Information</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3 sm:p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 text-center min-w-0">
                                <p className="text-xs uppercase tracking-wide text-white/60">Hours Worked</p>
                                <p className="mt-1 text-xl sm:text-2xl font-bold text-primary-400 tabular-nums break-words">{jobCard.labor_hours}h</p>
                            </div>
                            <div className="p-3 sm:p-4 rounded-lg bg-dark-50/30 border border-primary-500/10 text-center min-w-0">
                                <p className="text-xs uppercase tracking-wide text-white/60">Estimated Cost</p>
                                <p className="mt-1 text-xl sm:text-2xl font-bold text-primary-400 tabular-nums break-words">₹{(jobCard.labor_hours * 500).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6 min-w-0">
                    {/* Customer Card */}
                    <div className="card-luxury p-4 sm:p-6 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                            Customer
                        </h3>
                        {customer ? (
                            <Link to={`/customers/${customer.id}`} className="group block">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10 group-hover:border-primary-500/30 transition-colors">
                                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white break-words group-hover:text-primary-400 transition-colors">{customer.name}</p>
                                        <p className="text-sm text-white/60 break-words">{customer.phone}</p>
                                        <p className="text-sm text-white/60 break-all">{customer.email}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <p className="text-sm text-white/60">No customer assigned</p>
                        )}
                    </div>

                    {/* Vehicle Card */}
                    <div className="card-luxury p-4 sm:p-6 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TruckIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                            Vehicle
                        </h3>
                        {vehicle ? (
                            <div className="p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <p className="font-bold text-white break-words">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                <p className="text-sm text-white/60 break-words">Plate: {vehicle.license_plate}</p>
                                {vehicle.vin && <p className="text-sm text-white/60 break-all">VIN: {vehicle.vin}</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-white/60">No vehicle assigned</p>
                        )}
                    </div>

                    {/* Assigned Worker Card */}
                    <div className="card-luxury p-4 sm:p-6 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <UserCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                            Assigned Mechanic
                        </h3>
                        {worker ? (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="w-10 h-10 flex-shrink-0 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black">
                                    {worker.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white break-words">{worker.name}</p>
                                    <p className="text-sm text-primary-500 break-words">{worker.role}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-white/60">No worker assigned</p>
                        )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="card-luxury p-4 sm:p-6 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Progress</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-white/70">Stage</span>
                                <span className="font-semibold text-white whitespace-nowrap">
                                    {jobCard.status === JobStatus.PENDING && 'Not started'}
                                    {jobCard.status === JobStatus.IN_PROGRESS && 'In progress'}
                                    {jobCard.status === JobStatus.COMPLETED && 'Completed'}
                                    {jobCard.status === JobStatus.CANCELLED && 'Cancelled'}
                                </span>
                            </div>
                            <div className="w-full bg-dark-100/50 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-500 ${
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

            <Modal title="Edit Job Card Details" isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
                {editData && (
                    <form onSubmit={handleEditSave} className="space-y-4">
                        <div>
                            <label htmlFor="jc-edit-description" className="block text-sm font-medium text-white/80 mb-1.5">Job Description *</label>
                            <textarea 
                                id="jc-edit-description"
                                value={editData.description || ''} 
                                onChange={e => setEditData({...editData, description: e.target.value})} 
                                className="form-input w-full px-4 py-2.5 h-36 resize-y" 
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="jc-edit-hours" className="block text-sm font-medium text-white/80 mb-1.5">Labor Hours</label>
                            <input 
                                id="jc-edit-hours"
                                type="number" 
                                step="0.5"
                                min="0"
                                value={editData.labor_hours || 0} 
                                onChange={e => setEditData({...editData, labor_hours: Number(e.target.value)})} 
                                className="form-input w-full px-4 py-2.5"
                            />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={() => setIsEditOpen(false)} 
                                className="btn-secondary px-6 py-2.5 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-luxury px-6 py-2.5 rounded-xl"
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

export default JobCardDetail;
