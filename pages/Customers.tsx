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
            coupon_id: newCustomer.coupon_id || null,
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
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                        <UsersIcon className="h-6 w-6 flex-shrink-0 text-primary-500" />
                        Customer Management
                    </h1>
                    <p className="text-sm text-white/60 mt-1">Manage your client relationships and service history</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-luxury w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add New Customer</span>
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="card-luxury p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="flex-1 min-w-0 relative">
                        <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search name, phone, email..."
                            aria-label="Search customers by name, phone, email or coupon"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-11 pr-4 py-2.5 text-white placeholder-white/50"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        aria-label="Filter customers"
                        className="form-input w-full sm:w-auto sm:min-w-[170px] px-4 py-2.5 text-white"
                    >
                        <option value="all">All Customers</option>
                        <option value="vip">VIP Customers</option>
                        <option value="recent">Recent (30 days)</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-primary-500/10 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="text-white/60">Total</span>
                        <span className="font-semibold text-white tabular-nums">{state.customers.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <StarIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        <span className="text-white/60">VIP</span>
                        <span className="font-semibold text-white tabular-nums">{state.customers.filter(c => c.coupon_id).length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-white/60">Showing</span>
                        <span className="font-semibold text-white tabular-nums">{filteredCustomers.length}</span>
                    </div>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredCustomers.map(customer => {
                    const vehicleCount = getCustomerVehicleCount(customer.id);
                    return (
                        <div key={customer.id} className="card-luxury p-4 sm:p-5 group flex flex-col h-full min-w-0">
                            {/* Customer Header */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-11 h-11 flex-shrink-0 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black text-lg">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-white text-base sm:text-lg leading-snug break-words">{customer.name}</h3>
                                        <p className="text-primary-500/80 text-sm">
                                            {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {customer.coupon_id && (
                                    <div className="flex items-center gap-1 px-2 py-1 flex-shrink-0 whitespace-nowrap bg-primary-500/10 border border-primary-500/30 rounded-full">
                                        <StarIcon className="w-3 h-3 text-primary-500" />
                                        <span className="text-xs font-semibold text-primary-500">VIP</span>
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2.5 mb-4 text-sm">
                                {customer.phone && (
                                    <div className="flex items-start gap-3">
                                        <PhoneIcon className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                                        <span className="min-w-0 text-white/80 break-words">{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-start gap-3">
                                        <EmailIcon className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                                        <span className="min-w-0 text-white/80 break-words">{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-3">
                                        <LocationIcon className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                                        <span className="min-w-0 text-white/80 break-words">{customer.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* VIP Coupon */}
                            {customer.coupon_id && (
                                <div className="mb-4 px-3 py-2.5 bg-gradient-to-r from-primary-500/10 to-accent/10 border border-primary-500/20 rounded-lg">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xs font-medium text-white/80 flex-shrink-0">Coupon ID</span>
                                        <span className="min-w-0 text-sm font-bold text-primary-500 text-right break-all">{customer.coupon_id}</span>
                                    </div>
                                </div>
                            )}

                            {/* Footer: pinned to the bottom so cards in a row line up */}
                            <div className="mt-auto pt-4 border-t border-primary-500/10 space-y-3">
                                <Link
                                    to={`/customers/${customer.id}`}
                                    className="btn-secondary w-full py-2.5 rounded-lg flex items-center justify-center gap-2 group-hover:bg-primary-500/20 transition-colors duration-300"
                                >
                                    <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                                    <span>View Details</span>
                                </Link>

                                <p className="text-xs text-white/50">
                                    Member since {new Date(customer.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
                <div className="card-luxury p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersIcon className="w-8 h-8 text-primary-500/50" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Customers Found</h3>
                    <p className="text-sm text-white/60 mb-6">
                        {searchTerm || filterType !== 'all' ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-luxury w-full sm:w-auto px-5 py-2.5 rounded-xl"
                    >
                        Add First Customer
                    </button>
                </div>
            )}

            {/* Add Customer Modal */}
            <Modal title="Add New Customer" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter customer's full name"
                                value={newCustomer.name}
                                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                required
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                placeholder="customer@example.com"
                                value={newCustomer.email}
                                onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                required
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={newCustomer.phone}
                                onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Address
                            </label>
                            <input
                                type="text"
                                placeholder="123 Main Street, City, State"
                                value={newCustomer.address}
                                onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                VIP Coupon ID <span className="text-primary-500">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., VIP2025, GOLD123"
                                value={newCustomer.coupon_id}
                                onChange={e => setNewCustomer({...newCustomer, coupon_id: e.target.value})}
                                className="form-input w-full px-4 py-2.5"
                            />
                            <p className="text-xs text-white/50 mt-1.5">Customers with coupon IDs are marked as VIP</p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-luxury w-full sm:w-auto px-6 py-2.5 rounded-xl"
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