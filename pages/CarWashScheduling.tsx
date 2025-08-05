import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { CarWashBooking } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';

// Car Wash Icon
const CarWashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V13.5M8.25 21l4.5-4.5M16.5 10.5h.007v.008H16.5V10.5zm-9.75 0h.008v.008H6.75V10.5z" />
    </svg>
);

// Calendar Navigation Icons
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

// Clock Icon
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// User Icon
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const CarWashScheduling = () => {
    const { state, dispatch } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [newBooking, setNewBooking] = useState({
        customer_id: '',
        vehicle_id: '',
        service_type: 'Basic Wash' as CarWashBooking['service_type'],
        duration: 60,
        notes: ''
    });

    // Generate time slots from 8 AM to 6 PM
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    // Get bookings for the selected date
    const dayBookings = useMemo(() => {
        return (state.carwashBookings || []).filter(booking => booking.date === selectedDate);
    }, [state.carwashBookings, selectedDate]);

    // Get customer vehicles for selected customer
    const customerVehicles = useMemo(() => {
        if (!newBooking.customer_id) return [];
        return state.vehicles.filter(v => v.owner_id === newBooking.customer_id);
    }, [newBooking.customer_id, state.vehicles]);

    // Booking stats
    const bookingStats = useMemo(() => {
        const todaysBookings = dayBookings.length;
        const scheduled = dayBookings.filter(b => b.status === 'Scheduled').length;
        const inProgress = dayBookings.filter(b => b.status === 'In Progress').length;
        const completed = dayBookings.filter(b => b.status === 'Completed').length;

        return { todaysBookings, scheduled, inProgress, completed };
    }, [dayBookings]);

    const handleDateChange = (days: number) => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + days);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
    };

    const openBookingModal = (timeSlot: string) => {
        setSelectedTimeSlot(timeSlot);
        setNewBooking({
            customer_id: '',
            vehicle_id: '',
            service_type: 'Basic Wash',
            duration: 60,
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const booking: CarWashBooking = {
            id: `CW${Date.now()}`,
            customer_id: newBooking.customer_id,
            vehicle_id: newBooking.vehicle_id,
            date: selectedDate,
            time_slot: selectedTimeSlot,
            duration: newBooking.duration,
            service_type: newBooking.service_type,
            status: 'Scheduled',
            notes: newBooking.notes,
            created_at: new Date().toISOString()
        };

        await dispatch({ type: 'ADD_CARWASH_BOOKING', payload: booking });
        setIsModalOpen(false);
    };

    const getBookingForSlot = (timeSlot: string) => {
        return dayBookings.find(booking => {
            const storedTime = booking.time_slot;
            return storedTime === timeSlot || storedTime === timeSlot + ':00' || storedTime + ':00' === timeSlot;
        });
    };

    const getServiceColor = (serviceType: string) => {
        switch (serviceType) {
            case 'Basic Wash': return 'from-blue-500 to-blue-600';
            case 'Premium Wash': return 'from-purple-500 to-purple-600';
            case 'Full Detail': return 'from-green-500 to-green-600';
            case 'Interior Only': return 'from-orange-500 to-orange-600';
            case 'Exterior Only': return 'from-red-500 to-red-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusColor = (status: CarWashBooking['status']) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'In Progress': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'Completed': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-white/10 text-white/60 border-white/30';
        }
    };

    const updateBookingStatus = async (booking: CarWashBooking, newStatus: CarWashBooking['status']) => {
        const updatedBooking = { ...booking, status: newStatus };
        await dispatch({ type: 'UPDATE_CARWASH_BOOKING', payload: updatedBooking });
    };

    const deleteBooking = async (bookingId: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            await dispatch({ type: 'DELETE_CARWASH_BOOKING', payload: { id: bookingId } });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const isPast = new Date(selectedDate) < new Date(new Date().toISOString().split('T')[0]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <CarWashIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Car Wash Scheduling
                    </h1>
                    <p className="text-white/60 mt-2">Schedule and manage car wash appointments</p>
                </div>
                
                {/* Date Navigation */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-2 rounded-lg bg-dark-50/50 border border-primary-500/20 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-input px-4 py-2 text-center min-w-[160px]"
                    />
                    
                    <button
                        onClick={() => handleDateChange(1)}
                        className="p-2 rounded-lg bg-dark-50/50 border border-primary-500/20 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-luxury p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Today's Bookings</p>
                            <p className="text-2xl font-bold text-white">{bookingStats.todaysBookings}</p>
                        </div>
                        <CarWashIcon className="h-8 w-8 text-primary-500" />
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Scheduled</p>
                            <p className="text-2xl font-bold text-blue-400">{bookingStats.scheduled}</p>
                        </div>
                        <div className="text-2xl">⏰</div>
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">In Progress</p>
                            <p className="text-2xl font-bold text-yellow-400">{bookingStats.inProgress}</p>
                        </div>
                        <div className="text-2xl">🧽</div>
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Completed</p>
                            <p className="text-2xl font-bold text-green-400">{bookingStats.completed}</p>
                        </div>
                        <div className="text-2xl">✨</div>
                    </div>
                </div>
            </div>

            {/* Date Display */}
            <div className="card-luxury p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{formatDate(selectedDate)}</h3>
                        <p className="text-white/60 mt-1">
                            {isToday ? 'Today' : isPast ? 'Past Date' : 'Future Date'} • 
                            {bookingStats.todaysBookings} booking{bookingStats.todaysBookings !== 1 ? 's' : ''} scheduled
                        </p>
                    </div>
                    
                    {isToday && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <span className="text-primary-500 text-sm font-medium">Live</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Time Slots Schedule */}
            <div className="card-luxury overflow-hidden">
                <div className="p-6 border-b border-primary-500/10">
                    <h3 className="text-xl font-bold text-white">Schedule Grid</h3>
                    <p className="text-white/60">Click on empty slots to create new bookings</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 p-6">
                    {timeSlots.map(timeSlot => {
                        const booking = getBookingForSlot(timeSlot);
                        const customer = booking ? state.customers.find(c => c.id === booking.customer_id) : null;
                        const vehicle = booking ? state.vehicles.find(v => v.id === booking.vehicle_id) : null;

                        return (
                            <div key={timeSlot} className="min-h-[120px] rounded-lg border border-primary-500/10 p-3 hover:border-primary-500/30 transition-all duration-300">
                                {/* Time Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="w-4 h-4 text-primary-500" />
                                        <span className="font-semibold text-white text-sm">{timeSlot}</span>
                                    </div>
                                    {booking && (
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </div>
                                    )}
                                </div>

                                {booking ? (
                                    <div className={`bg-gradient-to-br ${getServiceColor(booking.service_type)} p-3 rounded-lg text-white relative group`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="w-4 h-4" />
                                                <span className="font-semibold text-sm truncate">
                                                    {customer?.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="text-xs opacity-90">
                                                {vehicle?.make} {vehicle?.model}
                                            </div>
                                            <div className="text-xs opacity-80">
                                                {booking.service_type} • {booking.duration}min
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center space-x-2">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => updateBookingStatus(booking, e.target.value as CarWashBooking['status'])}
                                                className="text-xs bg-white text-black border rounded px-2 py-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBooking(booking.id);
                                                }}
                                                className="text-white hover:text-red-300 p-1 bg-red-500/20 rounded"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {booking.notes && (
                                            <div className="mt-2 text-xs opacity-80 italic border-t border-white/20 pt-2">
                                                "{booking.notes}"
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openBookingModal(timeSlot)}
                                        className="w-full h-20 flex flex-col items-center justify-center text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg border-2 border-dashed border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 group"
                                    >
                                        <PlusIcon className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-medium">Available</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Service Type Legend */}
            <div className="card-luxury p-6">
                <h4 className="text-lg font-bold text-white mb-4">Service Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { type: 'Basic Wash', color: 'from-blue-500 to-blue-600', price: '$15', duration: '30min' },
                        { type: 'Premium Wash', color: 'from-purple-500 to-purple-600', price: '$25', duration: '45min' },
                        { type: 'Full Detail', color: 'from-green-500 to-green-600', price: '$50', duration: '2hrs' },
                        { type: 'Interior Only', color: 'from-orange-500 to-orange-600', price: '$20', duration: '1hr' },
                        { type: 'Exterior Only', color: 'from-red-500 to-red-600', price: '$12', duration: '30min' }
                    ].map((service) => (
                        <div key={service.type} className="flex items-center space-x-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                            <div className={`w-4 h-4 bg-gradient-to-br ${service.color} rounded-full`}></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">{service.type}</p>
                                <p className="text-xs text-white/60">{service.price} • {service.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            <Modal title={`Book Car Wash - ${selectedTimeSlot}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Customer *</label>
                            <select
                                value={newBooking.customer_id}
                                onChange={(e) => setNewBooking({ ...newBooking, customer_id: e.target.value, vehicle_id: '' })}
                                className="form-input w-full px-4 py-3"
                                required
                            >
                                <option value="">Select Customer</option>
                                {state.customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Vehicle *</label>
                            <select
                                value={newBooking.vehicle_id}
                                onChange={(e) => setNewBooking({ ...newBooking, vehicle_id: e.target.value })}
                                className="form-input w-full px-4 py-3"
                                disabled={!newBooking.customer_id}
                                required
                            >
                                <option value="">Select Vehicle</option>
                                {customerVehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Service Type *</label>
                            <select
                                value={newBooking.service_type}
                                onChange={(e) => setNewBooking({ ...newBooking, service_type: e.target.value as CarWashBooking['service_type'] })}
                                className="form-input w-full px-4 py-3"
                                required
                            >
                                <option value="Basic Wash">Basic Wash ($15)</option>
                                <option value="Premium Wash">Premium Wash ($25)</option>
                                <option value="Full Detail">Full Detail ($50)</option>
                                <option value="Interior Only">Interior Only ($20)</option>
                                <option value="Exterior Only">Exterior Only ($12)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Duration (minutes) *</label>
                            <input
                                type="number"
                                value={newBooking.duration}
                                onChange={(e) => setNewBooking({ ...newBooking, duration: Number(e.target.value) })}
                                className="form-input w-full px-4 py-3"
                                min="15"
                                max="180"
                                step="15"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">Special Instructions</label>
                            <textarea
                                value={newBooking.notes}
                                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                                className="form-input w-full px-4 py-3 h-20 resize-none"
                                placeholder="Any special requests or notes..."
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
                            Book Appointment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CarWashScheduling;