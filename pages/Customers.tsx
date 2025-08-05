import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Customer } from '../types';
import { DocumentMagnifyingGlassIcon, PlusIcon, UsersIcon } from '../components/Icons';

// Search Icon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

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

// Star Icon for VIP customers
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const Customers = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [newCustomer, setNewCustomer] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        coupon_id: '' 
    });

    const filteredCustomers = useMemo(() => {
        let filtered = state.customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.coupon_id && customer.coupon_id.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterType === 'vip') {
            filtered = filtered.filter(customer => customer.coupon_id);
        } else if (filterType === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter(customer => new Date(customer.created_at) > thirtyDaysAgo);
        }

        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [state.customers, searchTerm, filterType]);

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        const customerToAdd: Customer = {
            ...newCustomer,
            id: `C${Date.now()}`,
            coupon_id: newCustomer.coupon_id || undefined,
            communication_log: [],
            service_history: [],
            created_at: new Date().toISOString()
        };
        await dispatch({ type: 'ADD_CUSTOMER', payload: customerToAdd });
        setIsModalOpen(false);
        setNewCustomer({ name: '', email: '', phone: '', address: '', coupon_id: '' });
    };

    const getCustomerVehicleCount = (customerId: string) => {
        return state.vehicles.filter(v => v.owner_id === customerId).length;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <UsersIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Customer Management
                    </h1>
                    <p className="text-white/60 mt-2">Manage your client relationships and service history</p>
                </div>
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-luxury px-6 py-3 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add New Customer</span>
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="card-luxury p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50" />
                        <input
                            type="text"
                            placeholder="Search customers by name, phone, email, or coupon ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-12 pr-4 py-3 text-white placeholder-white/50"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="form-input px-4 py-3 text-white min-w-[150px]"
                    >
                        <option value="all">All Customers</option>
                        <option value="vip">VIP Customers</option>
                        <option value="recent">Recent (30 days)</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-primary-500/10">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                        <span className="text-sm text-white/80">Total: {state.customers.length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <StarIcon className="w-3 h-3 text-primary-500" />
                        <span className="text-sm text-white/80">VIP: {state.customers.filter(c => c.coupon_id).length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-white/80">Showing: {filteredCustomers.length}</span>
                    </div>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="card-luxury p-6 group">
                        {/* Customer Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black text-lg">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{customer.name}</h3>
                                    <p className="text-primary-500/80 text-sm">
                                        {getCustomerVehicleCount(customer.id)} vehicle{getCustomerVehicleCount(customer.id) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            
                            {customer.coupon_id && (
                                <div className="flex items-center space-x-1 px-2 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full">
                                    <StarIcon className="w-3 h-3 text-primary-500" />
                                    <span className="text-xs font-semibold text-primary-500">VIP</span>
                                </div>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-3 mb-6">
                            {customer.phone && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <PhoneIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                    <span className="text-white/80">{customer.phone}</span>
                                </div>
                            )}
                            {customer.email && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <EmailIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                    <span className="text-white/80 truncate">{customer.email}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <LocationIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                    <span className="text-white/80 truncate">{customer.address}</span>
                                </div>
                            )}
                        </div>

                        {/* VIP Coupon */}
                        {customer.coupon_id && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-primary-500/10 to-accent/10 border border-primary-500/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-white/80">Coupon ID</span>
                                    <span className="text-sm font-bold text-primary-500">{customer.coupon_id}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <Link 
                            to={`/customers/${customer.id}`} 
                            className="btn-secondary w-full py-2.5 rounded-lg flex items-center justify-center space-x-2 group-hover:bg-primary-500/20 transition-all duration-300"
                        >
                            <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                            <span>View Details</span>
                        </Link>

                        {/* Member Since */}
                        <div className="mt-4 pt-4 border-t border-primary-500/10">
                            <p className="text-xs text-white/50">
                                Member since {new Date(customer.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
                <div className="card-luxury p-12 text-center">
                    <div className="w-20 h-20 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UsersIcon className="w-10 h-10 text-primary-500/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Customers Found</h3>
                    <p className="text-white/60 mb-6">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-luxury px-6 py-3 rounded-xl"
                    >
                        Add First Customer
                    </button>
                </div>
            )}

            {/* Add Customer Modal */}
            <Modal title="Add New Customer" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleAddCustomer} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Full Name *
                            </label>
                            <input 
                                type="text" 
                                placeholder="Enter customer's full name"
                                value={newCustomer.name} 
                                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} 
                                className="form-input w-full px-4 py-3"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email Address *
                            </label>
                            <input 
                                type="email" 
                                placeholder="customer@example.com"
                                value={newCustomer.email} 
                                onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} 
                                className="form-input w-full px-4 py-3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Phone Number *
                            </label>
                            <input 
                                type="tel" 
                                placeholder="+1 (555) 123-4567"
                                value={newCustomer.phone} 
                                onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} 
                                className="form-input w-full px-4 py-3"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Address
                            </label>
                            <input 
                                type="text" 
                                placeholder="123 Main Street, City, State"
                                value={newCustomer.address} 
                                onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} 
                                className="form-input w-full px-4 py-3"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                VIP Coupon ID <span className="text-primary-500">(Optional)</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g., VIP2025, GOLD123"
                                value={newCustomer.coupon_id} 
                                onChange={e => setNewCustomer({...newCustomer, coupon_id: e.target.value})} 
                                className="form-input w-full px-4 py-3"
                            />
                            <p className="text-xs text-white/50 mt-1">Customers with coupon IDs are marked as VIP</p>
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
                            Save Customer
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;