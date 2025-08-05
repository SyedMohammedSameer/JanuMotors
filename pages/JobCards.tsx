import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus, JobCard } from '../types';
import Modal from '../components/Modal';
import { WrenchScrewdriverIcon, PlusIcon, UsersIcon, TruckIcon, UserCircleIcon } from '../components/Icons';

// Filter Icon
const FunnelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

// Search Icon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

// Calendar Icon
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
    </svg>
);

const JobCards = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const initialJobCardState = {
        customer_id: '',
        vehicle_id: '',
        assigned_to: '',
        description: ''
    };
    const [newJobCard, setNewJobCard] = useState(initialJobCardState);
    const [selectedCustomerForJob, setSelectedCustomerForJob] = useState('');

    const customerVehicles = useMemo(() => {
        if (!selectedCustomerForJob) return [];
        return state.vehicles.filter(v => v.owner_id === selectedCustomerForJob);
    }, [selectedCustomerForJob, state.vehicles]);

    const filteredJobCards = useMemo(() => {
        let filtered = state.jobCards.filter(job => {
            const customer = state.customers.find(c => c.id === job.customer_id);
            const vehicle = state.vehicles.find(v => v.id === job.vehicle_id);
            const worker = state.workers.find(w => w.id === job.assigned_to);
            
            const searchMatch = 
                job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                worker?.name.toLowerCase().includes(searchTerm.toLowerCase());

            return searchMatch;
        });

        if (statusFilter !== 'all') {
            filtered = filtered.filter(job => job.status === statusFilter);
        }

        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [state.jobCards, state.customers, state.vehicles, state.workers, searchTerm, statusFilter]);

    const jobStats = useMemo(() => {
        const total = state.jobCards.length;
        const pending = state.jobCards.filter(j => j.status === JobStatus.PENDING).length;
        const inProgress = state.jobCards.filter(j => j.status === JobStatus.IN_PROGRESS).length;
        const completed = state.jobCards.filter(j => j.status === JobStatus.COMPLETED).length;

        return { total, pending, inProgress, completed };
    }, [state.jobCards]);
    
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

    const handleCreateJobCard = async (e: React.FormEvent) => {
        e.preventDefault();
        const jobCardToAdd: JobCard = {
            id: `J${Date.now()}`,
            customer_id: newJobCard.customer_id,
            vehicle_id: newJobCard.vehicle_id,
            assigned_to: newJobCard.assigned_to,
            description: newJobCard.description,
            status: JobStatus.PENDING,
            parts_used: [],
            labor_hours: 0,
            created_at: new Date().toISOString(),
        };
        await dispatch({ type: 'ADD_JOB_CARD', payload: jobCardToAdd });
        setIsModalOpen(false);
        setNewJobCard(initialJobCardState);
        setSelectedCustomerForJob('');
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <WrenchScrewdriverIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Job Management
                    </h1>
                    <p className="text-white/60 mt-2">Track and manage service orders</p>
                </div>
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-luxury px-6 py-3 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Job Card</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-luxury p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Total Jobs</p>
                            <p className="text-2xl font-bold text-white">{jobStats.total}</p>
                        </div>
                        <div className="text-2xl">📋</div>
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Pending</p>
                            <p className="text-2xl font-bold text-yellow-400">{jobStats.pending}</p>
                        </div>
                        <div className="text-2xl">⏳</div>
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">In Progress</p>
                            <p className="text-2xl font-bold text-blue-400">{jobStats.inProgress}</p>
                        </div>
                        <div className="text-2xl">🔧</div>
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Completed</p>
                            <p className="text-2xl font-bold text-green-400">{jobStats.completed}</p>
                        </div>
                        <div className="text-2xl">✅</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card-luxury p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50" />
                        <input
                            type="text"
                            placeholder="Search by job ID, customer, vehicle, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-12 pr-4 py-3"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-5 h-5 text-primary-500/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input px-4 py-3 min-w-[140px]"
                        >
                            <option value="all">All Status</option>
                            <option value={JobStatus.PENDING}>Pending</option>
                            <option value={JobStatus.IN_PROGRESS}>In Progress</option>
                            <option value={JobStatus.COMPLETED}>Completed</option>
                            <option value={JobStatus.CANCELLED}>Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobCards.map(job => {
                    const customer = state.customers.find(c => c.id === job.customer_id);
                    const vehicle = state.vehicles.find(v => v.id === job.vehicle_id);
                    const worker = state.workers.find(w => w.id === job.assigned_to);
                    
                    return (
                        <div key={job.id} className="card-luxury p-6 group">
                            {/* Job Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg font-mono">#{job.id}</h3>
                                    <p className="text-primary-500/80 text-sm flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(job.status)}`}>
                                    <span>{getStatusIcon(job.status)}</span>
                                    <span>{job.status}</span>
                                </div>
                            </div>

                            {/* Customer & Vehicle Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <UsersIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{customer?.name || 'Unknown Customer'}</p>
                                        <p className="text-xs text-white/60">{customer?.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <TruckIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {vehicle?.year} {vehicle?.make} {vehicle?.model}
                                        </p>
                                        <p className="text-xs text-white/60">{vehicle?.license_plate}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <UserCircleIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{worker?.name || 'Unassigned'}</p>
                                        <p className="text-xs text-white/60">{worker?.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-white/80 mb-2">Description</h4>
                                <p className="text-sm text-white/70 bg-dark-50/30 p-3 rounded-lg border border-primary-500/10 line-clamp-3">
                                    {job.description}
                                </p>
                            </div>

                            {/* Action Button */}
                            <Link 
                                to={`/job-cards/${job.id}`}
                                className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center space-x-2 group-hover:bg-primary-500/20 transition-all duration-300"
                            >
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                                <span>View Details</span>
                            </Link>

                            {/* Progress Indicator */}
                            <div className="mt-4 pt-4 border-t border-primary-500/10">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>Progress</span>
                                    <span>
                                        {job.status === JobStatus.PENDING && '0%'}
                                        {job.status === JobStatus.IN_PROGRESS && '50%'}
                                        {job.status === JobStatus.COMPLETED && '100%'}
                                        {job.status === JobStatus.CANCELLED && 'Cancelled'}
                                    </span>
                                </div>
                                <div className="mt-2 w-full bg-dark-100/50 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                            job.status === JobStatus.PENDING ? 'w-0 bg-yellow-500' :
                                            job.status === JobStatus.IN_PROGRESS ? 'w-1/2 bg-blue-500' :
                                            job.status === JobStatus.COMPLETED ? 'w-full bg-green-500' :
                                            'w-full bg-red-500'
                                        }`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredJobCards.length === 0 && (
                <div className="card-luxury p-12 text-center">
                    <div className="w-20 h-20 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <WrenchScrewdriverIcon className="w-10 h-10 text-primary-500/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Job Cards Found</h3>
                    <p className="text-white/60 mb-6">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Create your first job card to get started'}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-luxury px-6 py-3 rounded-xl"
                    >
                        Create First Job Card
                    </button>
                </div>
            )}

            {/* Create Job Card Modal */}
            <Modal title="Create New Job Card" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
                <form onSubmit={handleCreateJobCard} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Customer *</label>
                            <select
                                value={selectedCustomerForJob}
                                onChange={(e) => {
                                    setSelectedCustomerForJob(e.target.value);
                                    setNewJobCard({ ...newJobCard, customer_id: e.target.value, vehicle_id: '' });
                                }}
                                className="form-input w-full px-4 py-3"
                                required
                            >
                                <option value="">Select a customer</option>
                                {state.customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Vehicle *</label>
                            <select
                                value={newJobCard.vehicle_id}
                                onChange={e => setNewJobCard({ ...newJobCard, vehicle_id: e.target.value })}
                                className="form-input w-full px-4 py-3"
                                disabled={!selectedCustomerForJob}
                                required
                            >
                                <option value="">Select a vehicle</option>
                                {customerVehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.year} {v.make} {v.model} ({v.license_plate})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">Assign To *</label>
                            <select
                                value={newJobCard.assigned_to}
                                onChange={e => setNewJobCard({ ...newJobCard, assigned_to: e.target.value })}
                                className="form-input w-full px-4 py-3"
                                required
                            >
                                <option value="">Select a mechanic</option>
                                {state.workers.filter(w => w.role === 'Mechanic').map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">Job Description *</label>
                            <textarea
                                placeholder="Describe the work to be performed (e.g., Oil change, brake repair, engine diagnostics...)"
                                value={newJobCard.description}
                                onChange={e => setNewJobCard({ ...newJobCard, description: e.target.value })}
                                className="form-input w-full px-4 py-3 h-32 resize-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            Create Job Card
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JobCards;