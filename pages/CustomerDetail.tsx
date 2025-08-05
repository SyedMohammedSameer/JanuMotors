import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Vehicle, CommunicationLog, ServiceHistory } from '../types';
import { PlusIcon, UsersIcon, TruckIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon, WrenchScrewdriverIcon } from '../components/Icons';

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

    return (
        <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 dark:bg-primary-900/50 rounded-full p-3">
                         <UsersIcon className="h-8 w-8 text-primary-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{customer.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{customer.email} | {customer.phone}</p>
                        <p className="text-gray-500 dark:text-gray-400">{customer.address}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vehicles Card */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center"><TruckIcon className="h-5 w-5 mr-2"/>Vehicles</h3>
                        <button onClick={() => setVehicleModalOpen(true)} className="flex items-center text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition">
                            <PlusIcon className="h-4 w-4 mr-1"/> Add Vehicle
                        </button>
                    </div>
                    <ul className="divide-y dark:divide-gray-700 p-4">
                        {vehicles.length > 0 ? vehicles.map(v => (
                            <li key={v.id} className="py-2">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{v.year} {v.make} {v.model}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Plate: {v.license_plate} | VIN: {v.vin}</p>
                            </li>
                        )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No vehicles found.</p>}
                    </ul>
                </div>

                {/* Service History Card */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center"><WrenchScrewdriverIcon className="h-5 w-5 mr-2"/>Service History</h3>
                        <button onClick={() => setServiceHistoryModalOpen(true)} className="flex items-center text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition">
                            <PlusIcon className="h-4 w-4 mr-1"/> Add Record
                        </button>
                    </div>
                     <ul className="divide-y dark:divide-gray-700 p-4">
                        {customer.service_history.length > 0 ? customer.service_history.map(s => (
                            <li key={s.id} className="py-2 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{s.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(s.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-bold text-green-600 dark:text-green-400">${s.cost.toFixed(2)}</p>
                            </li>
                        )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No service history found.</p>}
                    </ul>
                </div>
            </div>
            
            {/* Communication Log Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center"><ChatBubbleLeftRightIcon className="h-5 w-5 mr-2"/>Communication Log</h3>
                    <button onClick={() => setCommLogModalOpen(true)} className="flex items-center text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition">
                        <PlusIcon className="h-4 w-4 mr-1"/> Add Log
                    </button>
                </div>
                <ul className="divide-y dark:divide-gray-700 p-4">
                    {customer.communication_log.length > 0 ? customer.communication_log.map(log => (
                        <li key={log.id} className="py-2">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{log.type} on {new Date(log.date).toLocaleString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-2 border-l-2 border-gray-200 dark:border-gray-600 ml-1 mt-1">{log.notes}</p>
                        </li>
                    )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No communication logs found.</p>}
                </ul>
            </div>

            {/* Modals */}
            <Modal title="Add New Vehicle" isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)}>
                <form onSubmit={handleAddVehicle} className="space-y-4">
                    <input type="text" placeholder="Make" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <input type="text" placeholder="Model" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <input type="number" placeholder="Year" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: Number(e.target.value)})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <input type="text" placeholder="License Plate" value={newVehicle.license_plate} onChange={e => setNewVehicle({...newVehicle, license_plate: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <input type="text" placeholder="VIN" value={newVehicle.vin} onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setVehicleModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Add Vehicle</button>
                    </div>
                </form>
            </Modal>
            
            <Modal title="Add Communication Log" isOpen={isCommLogModalOpen} onClose={() => setCommLogModalOpen(false)}>
                <form onSubmit={handleAddCommLog} className="space-y-4">
                    <select value={newCommLog.type} onChange={e => setNewCommLog({ ...newCommLog, type: e.target.value as any })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option>Call</option>
                        <option>Visit</option>
                        <option>Email</option>
                    </select>
                    <textarea placeholder="Notes..." value={newCommLog.notes} onChange={e => setNewCommLog({ ...newCommLog, notes: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={4} required></textarea>
                     <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setCommLogModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Add Log</button>
                    </div>
                </form>
            </Modal>
            
            <Modal title="Add Service Record" isOpen={isServiceHistoryModalOpen} onClose={() => setServiceHistoryModalOpen(false)}>
                <form onSubmit={handleAddServiceHistory} className="space-y-4">
                    <input type="text" placeholder="Service Description" value={newServiceHistory.description} onChange={e => setNewServiceHistory({ ...newServiceHistory, description: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <input type="number" placeholder="Cost" value={newServiceHistory.cost} onChange={e => setNewServiceHistory({ ...newServiceHistory, cost: Number(e.target.value) })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setServiceHistoryModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Add Record</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CustomerDetail;