import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus, JobCard } from '../types';
import Modal from '../components/Modal';
import { WrenchScrewdriverIcon, PlusIcon, UsersIcon, TruckIcon, UserCircleIcon, TrashIcon } from '../components/Icons';
import { PartLine, addPart, removePart, parseLaborHours, parsePartQuantity, MAX_LABOR_HOURS } from '../utils/jobCardForm';

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
    const [laborHours, setLaborHours] = useState('');
    const [partsUsed, setPartsUsed] = useState<PartLine[]>([]);
    const [partToAdd, setPartToAdd] = useState('');
    const [partQuantity, setPartQuantity] = useState('1');

    // Every way of closing the form (Cancel, X, Esc, backdrop, successful create) goes through here so the next
    // time it opens it is empty instead of showing the previous, half-filled values.
    const resetCreateForm = () => {
        setNewJobCard(initialJobCardState);
        setSelectedCustomerForJob('');
        setLaborHours('');
        setPartsUsed([]);
        setPartToAdd('');
        setPartQuantity('1');
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetCreateForm();
    };

    const handleAddPart = () => {
        setPartsUsed(parts => addPart(parts, partToAdd, parsePartQuantity(partQuantity)));
        setPartToAdd('');
        setPartQuantity('1');
    };

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

    const handleCreateJobCard = async (e: React.FormEvent) => {
        e.preventDefault();
        // A part that is selected but whose "Add" button was not pressed is included too, so it is never silently lost
        // (parts cannot be edited after the job card is created).
        const finalParts = partToAdd ? addPart(partsUsed, partToAdd, parsePartQuantity(partQuantity)) : partsUsed;
        const jobCardToAdd: JobCard = {
            id: `J${Date.now()}`,
            customer_id: newJobCard.customer_id,
            vehicle_id: newJobCard.vehicle_id,
            assigned_to: newJobCard.assigned_to,
            description: newJobCard.description,
            status: JobStatus.PENDING,
            parts_used: finalParts,
            labor_hours: parseLaborHours(laborHours),
            created_at: new Date().toISOString(),
        };
        await dispatch({ type: 'ADD_JOB_CARD', payload: jobCardToAdd });
        handleCloseModal();
    };
    
    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Job Management</h1>
                    <p className="text-sm text-white/60 mt-1">Track and manage service orders</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-luxury w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Job Card</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total Jobs', value: jobStats.total, icon: '📋', border: 'border-primary-500', valueColor: 'text-white' },
                    { label: 'Pending', value: jobStats.pending, icon: '⏳', border: 'border-yellow-500', valueColor: 'text-yellow-400' },
                    { label: 'In Progress', value: jobStats.inProgress, icon: '🔧', border: 'border-blue-500', valueColor: 'text-blue-400' },
                    { label: 'Completed', value: jobStats.completed, icon: '✅', border: 'border-green-500', valueColor: 'text-green-400' },
                ].map(stat => (
                    <div key={stat.label} className={`card-luxury p-4 border-l-4 ${stat.border}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wide text-white/60 whitespace-nowrap">{stat.label}</p>
                                <p className={`text-xl sm:text-2xl font-bold tabular-nums mt-1 ${stat.valueColor}`}>{stat.value}</p>
                            </div>
                            <div className="hidden sm:flex lg:hidden xl:flex items-center justify-center flex-shrink-0 h-10 w-10 rounded-xl bg-white/5 text-lg" aria-hidden="true">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter */}
            <div className="card-luxury p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0 relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500/50 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by ID, customer, vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full min-w-0 pl-12 pr-4 py-2.5"
                        />
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <FunnelIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500/50 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                            className="form-input w-full sm:w-auto sm:min-w-[160px] pl-11 pr-4 py-2.5"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredJobCards.map(job => {
                    const customer = state.customers.find(c => c.id === job.customer_id);
                    const vehicle = state.vehicles.find(v => v.id === job.vehicle_id);
                    const worker = state.workers.find(w => w.id === job.assigned_to);
                    const customerName = customer?.name || 'Unknown Customer';
                    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
                    const workerName = worker?.name || 'Unassigned';

                    return (
                        <div key={job.id} className="card-luxury p-4 sm:p-5 flex flex-col">
                            {/* Job Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-base font-mono break-all" title={`#${job.id}`}>#{job.id}</h3>
                                    <p className="text-xs text-white/60 flex items-center gap-1.5 mt-1">
                                        <CalendarIcon className="w-4 h-4 flex-shrink-0 text-primary-500/80" />
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <span className={`flex-shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>

                            {/* Customer, Vehicle & Mechanic */}
                            <div className="mt-4 space-y-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="flex items-start gap-3">
                                    <UsersIcon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white break-words line-clamp-2" title={customerName}>{customerName}</p>
                                        {customer?.phone && <p className="text-xs text-white/60 break-words">{customer.phone}</p>}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <TruckIcon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white break-words line-clamp-2" title={vehicleName}>{vehicleName}</p>
                                        {vehicle?.license_plate && <p className="text-xs text-white/60 break-words">{vehicle.license_plate}</p>}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <UserCircleIcon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium break-words line-clamp-2 ${worker ? 'text-white' : 'text-white/60'}`} title={workerName}>{workerName}</p>
                                        {worker?.role && <p className="text-xs text-white/60 break-words">{worker.role}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="mt-4 flex-1">
                                <h4 className="text-xs uppercase tracking-wide text-white/60 mb-1.5">Description</h4>
                                <p className="text-sm text-white/70 break-words line-clamp-3" title={job.description}>
                                    {job.description}
                                </p>
                            </div>

                            {/* Action Button */}
                            <Link
                                to={`/job-cards/${job.id}`}
                                className="btn-secondary mt-4 w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-primary-500/20 transition-colors"
                            >
                                <WrenchScrewdriverIcon className="w-5 h-5 flex-shrink-0" />
                                <span>View Details</span>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredJobCards.length === 0 && (
                <div className="card-luxury p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-primary-500/50" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Job Cards Found</h3>
                    <p className="text-sm text-white/60 mb-6">
                        {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first job card to get started'}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-luxury w-full sm:w-auto px-5 py-2.5 rounded-xl"
                    >
                        Create First Job Card
                    </button>
                </div>
            )}

            {/* Create Job Card Modal */}
            <Modal title="Create New Job Card" isOpen={isModalOpen} onClose={handleCloseModal} size="md">
                <form onSubmit={handleCreateJobCard} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Customer *</label>
                            <select
                                value={selectedCustomerForJob}
                                onChange={(e) => {
                                    setSelectedCustomerForJob(e.target.value);
                                    setNewJobCard({ ...newJobCard, customer_id: e.target.value, vehicle_id: '' });
                                }}
                                className="form-input w-full min-w-0 px-4 py-2.5"
                                required
                            >
                                <option value="">Select a customer</option>
                                {state.customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2 min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Vehicle *</label>
                            <select
                                value={newJobCard.vehicle_id}
                                onChange={e => setNewJobCard({ ...newJobCard, vehicle_id: e.target.value })}
                                className="form-input w-full min-w-0 px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

                        <div className="sm:col-span-2 min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Assign To *</label>
                            <select
                                value={newJobCard.assigned_to}
                                onChange={e => setNewJobCard({ ...newJobCard, assigned_to: e.target.value })}
                                className="form-input w-full min-w-0 px-4 py-2.5"
                                required
                            >
                                <option value="">Select a mechanic</option>
                                {state.workers.filter(w => w.role === 'Mechanic').map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Job Description *</label>
                            <textarea
                                placeholder="Describe the work to be performed (e.g., Oil change, brake repair, engine diagnostics...)"
                                value={newJobCard.description}
                                onChange={e => setNewJobCard({ ...newJobCard, description: e.target.value })}
                                className="form-input w-full px-4 py-2.5 h-32 resize-none"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2 sm:max-w-[14rem]">
                            <label htmlFor="job-labor-hours" className="block text-sm font-medium text-white/80 mb-1.5">Labour Hours</label>
                            <input
                                id="job-labor-hours"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                max={MAX_LABOR_HOURS}
                                step="0.25"
                                placeholder="0"
                                value={laborHours}
                                onChange={e => setLaborHours(e.target.value)}
                                className="form-input w-full px-4 py-2.5"
                            />
                        </div>

                        <div className="sm:col-span-2 min-w-0">
                            <label htmlFor="job-part-select" className="block text-sm font-medium text-white/80 mb-1.5">Parts Used <span className="text-white/50 font-normal">(optional)</span></label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    id="job-part-select"
                                    value={partToAdd}
                                    onChange={e => setPartToAdd(e.target.value)}
                                    className="form-input flex-1 min-w-0 px-4 py-2.5"
                                >
                                    <option value="">Select a part</option>
                                    {state.inventory.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ({item.quantity > 0 ? `${item.quantity} in stock` : 'out of stock'})
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        aria-label="Part quantity"
                                        value={partQuantity}
                                        onChange={e => setPartQuantity(e.target.value)}
                                        className="form-input w-24 px-4 py-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddPart}
                                        disabled={!partToAdd || parsePartQuantity(partQuantity) < 1}
                                        className="btn-secondary px-5 py-2.5 rounded-xl flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            {partToAdd && (
                                <p className="mt-2 text-xs text-primary-400">
                                    Not added yet. Press Add, or it will be included when you create the job card.
                                </p>
                            )}

                            {partsUsed.length > 0 && (
                                <ul className="mt-3 divide-y divide-primary-500/10 rounded-xl border border-primary-500/20 bg-dark-50/30">
                                    {partsUsed.map(part => {
                                        const item = state.inventory.find(i => i.id === part.itemId);
                                        const short = item ? part.quantity > item.quantity : false;
                                        return (
                                            <li key={part.itemId} className="flex items-center gap-3 px-3 py-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-white break-words">{item?.name ?? 'Unknown part'}</p>
                                                    {short && (
                                                        <p className="text-xs text-primary-400">Only {item?.quantity} in stock</p>
                                                    )}
                                                </div>
                                                <span className="text-sm text-white/80 tabular-nums whitespace-nowrap">× {part.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setPartsUsed(parts => removePart(parts, part.itemId))}
                                                    aria-label={`Remove ${item?.name ?? 'part'}`}
                                                    className="flex-shrink-0 p-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="btn-secondary px-5 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-luxury px-5 py-2.5 rounded-xl"
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