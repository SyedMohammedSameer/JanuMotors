import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus, JobCard } from '../types';
import Modal from '../components/Modal';

const JobCards = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

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
    
    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case JobStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case JobStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case JobStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Job Cards</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Create Job Card
                </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Job ID</th>
                            <th scope="col" className="px-6 py-3">Customer & Vehicle</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.jobCards.map(job => {
                            const customer = state.customers.find(c => c.id === job.customer_id);
                            const vehicle = state.vehicles.find(v => v.id === job.vehicle_id);
                            const worker = state.workers.find(w => w.id === job.assigned_to);
                            return (
                                <tr key={job.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">{job.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{customer?.name}</div>
                                        <div className="text-xs text-gray-500">{vehicle?.make} {vehicle?.model} ({vehicle?.license_plate})</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm truncate" title={job.description}>{job.description}</td>
                                    <td className="px-6 py-4">{worker?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/job-cards/${job.id}`} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Details</Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Modal title="Create New Job Card" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleCreateJobCard} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                        <select
                            value={selectedCustomerForJob}
                            onChange={(e) => {
                                setSelectedCustomerForJob(e.target.value);
                                setNewJobCard({ ...newJobCard, customer_id: e.target.value, vehicle_id: '' });
                            }}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="">Select a customer</option>
                            {state.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
                        <select
                            value={newJobCard.vehicle_id}
                            onChange={e => setNewJobCard({ ...newJobCard, vehicle_id: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            disabled={!selectedCustomerForJob}
                            required
                        >
                            <option value="">Select a vehicle</option>
                            {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                        <select
                            value={newJobCard.assigned_to}
                            onChange={e => setNewJobCard({ ...newJobCard, assigned_to: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="">Select a mechanic</option>
                            {state.workers.filter(w => w.role === 'Mechanic').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                        <textarea
                            placeholder="Describe the work to be done..."
                            value={newJobCard.description}
                            onChange={e => setNewJobCard({ ...newJobCard, description: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={4}
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Create Job</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JobCards;