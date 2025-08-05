import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Customer } from '../types';
import { DocumentMagnifyingGlassIcon } from '../components/Icons';

const Customers = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCustomer, setNewCustomer] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        coupon_id: '' 
    });

    const filteredCustomers = useMemo(() => {
        return state.customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.coupon_id && customer.coupon_id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [state.customers, searchTerm]);

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        const customerToAdd: Customer = {
            ...newCustomer,
            id: `C${Date.now()}`, // Supabase will generate a real UUID if not provided
            coupon_id: newCustomer.coupon_id || undefined, // Convert empty string to undefined
            communication_log: [],
            service_history: [],
            created_at: new Date().toISOString()
        };
        await dispatch({ type: 'ADD_CUSTOMER', payload: customerToAdd });
        setIsModalOpen(false);
        setNewCustomer({ name: '', email: '', phone: '', address: '', coupon_id: '' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer List</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Add New Customer
                </button>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, phone, email, or coupon ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Contact</th>
                            <th scope="col" className="px-6 py-3">Coupon ID</th>
                            <th scope="col" className="px-6 py-3">Vehicles</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{customer.name}</td>
                                <td className="px-6 py-4">
                                    <div>{customer.phone}</div>
                                    <div className="text-xs text-gray-400">{customer.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {customer.coupon_id ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/50 dark:text-green-300">
                                            {customer.coupon_id}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">No coupon</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{state.vehicles.filter(v => v.owner_id === customer.id).length}</td>
                                <td className="px-6 py-4">
                                    <Link to={`/customers/${customer.id}`} className="font-medium text-primary-600 dark:text-primary-500 hover:underline flex items-center">
                                      <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-1" />
                                      View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal title="Add New Customer" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={newCustomer.name} 
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={newCustomer.email} 
                        onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                        required
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={newCustomer.phone} 
                        onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="Address" 
                        value={newCustomer.address} 
                        onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                    />
                    <input 
                        type="text" 
                        placeholder="Coupon ID (Optional)" 
                        value={newCustomer.coupon_id} 
                        onChange={e => setNewCustomer({...newCustomer, coupon_id: e.target.value})} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                    />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Save Customer</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;