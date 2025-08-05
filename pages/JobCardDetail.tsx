import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus } from '../types';
import { ClipboardDocumentListIcon, UsersIcon, TruckIcon, UserCircleIcon, WrenchScrewdriverIcon } from '../components/Icons';

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
            case JobStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case JobStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case JobStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary-100 dark:bg-primary-900/50 rounded-full p-3">
                             <ClipboardDocumentListIcon className="h-8 w-8 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Job Card #{jobCard.id}</h2>
                            <p className="text-gray-500 dark:text-gray-400">Created on: {new Date(jobCard.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${getStatusColor(jobCard.status)}`}>
                            {jobCard.status}
                       </span>
                        {jobCard.completed_date && <p className="text-xs text-gray-500 mt-1">Completed: {new Date(jobCard.completed_date).toLocaleDateString()}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center"><WrenchScrewdriverIcon className="h-5 w-5 mr-2" />Job Details</h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{jobCard.description}</p>
                        <div className="mt-6">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Update Status</label>
                            <select
                                id="status"
                                value={jobCard.status}
                                onChange={handleStatusChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {Object.values(JobStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"><UsersIcon className="h-5 w-5 mr-2" />Customer</h3>
                        {customer && (
                             <Link to={`/customers/${customer.id}`} className="hover:underline text-primary-600 dark:text-primary-400">
                                <p className="font-bold">{customer.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                            </Link>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"><TruckIcon className="h-5 w-5 mr-2" />Vehicle</h3>
                         {vehicle && (
                            <div>
                                <p className="font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Plate: {vehicle.license_plate}</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center"><UserCircleIcon className="h-5 w-5 mr-2" />Assigned Mechanic</h3>
                         {worker && (
                            <div>
                                <p className="font-bold">{worker.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{worker.role}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCardDetail;