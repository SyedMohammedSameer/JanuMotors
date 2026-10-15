import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { CarWashBooking } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';
import { todayIST, addDaysToDateString } from '../utils/dateIST';

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

// Sparkles Icon (In Progress stat)
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

// Check Circle Icon (Completed stat)
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CarWashScheduling = () => {
    const { state, dispatch } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(todayIST());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [newBooking, setNewBooking] = useState({
        customer_id: '',
        vehicle_id: '',
        walk_in_name: '',
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
        setSelectedDate(addDaysToDateString(selectedDate, days));
    };

    const openBookingModal = (timeSlot: string) => {
        setSelectedTimeSlot(timeSlot);
        setNewBooking({
            customer_id: '',
            vehicle_id: '',
            walk_in_name: '',
            service_type: 'Basic Wash',
            duration: 60,
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Require either a registered customer or a walk-in name
        if (!newBooking.customer_id && !newBooking.walk_in_name.trim()) {
            alert('Please select a customer or enter a walk-in name.');
            return;
        }

        const booking: CarWashBooking = {
            id: `CW${Date.now()}`,
            customer_id: newBooking.customer_id || newBooking.walk_in_name.trim(),
            vehicle_id: newBooking.vehicle_id || '',
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

    // All bookings that fall in a slot (a slot can hold more than one booking)
    const getBookingsForSlot = (timeSlot: string) => {
        return dayBookings.filter(booking => {
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

    const getServiceAccent = (serviceType: string) => {
        switch (serviceType) {
            case 'Basic Wash': return 'border-l-blue-500';
            case 'Premium Wash': return 'border-l-purple-500';
            case 'Full Detail': return 'border-l-green-500';
            case 'Interior Only': return 'border-l-orange-500';
            case 'Exterior Only': return 'border-l-red-500';
            default: return 'border-l-gray-500';
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
        // dateStr is a plain YYYY-MM-DD (parsed as UTC), so format it in UTC too or it can show the previous day
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    const todayStr = todayIST();
    const isToday = selectedDate === todayStr;
    const isPast = selectedDate < todayStr;

    const statTiles = [
        { label: 'Bookings', value: bookingStats.todaysBookings, Icon: CarWashIcon, accent: 'border-l-white/40', valueColor: 'text-white', iconColor: 'text-white/80 bg-white/10' },
        { label: 'Scheduled', value: bookingStats.scheduled, Icon: ClockIcon, accent: 'border-l-blue-500', valueColor: 'text-blue-400', iconColor: 'text-blue-400 bg-blue-500/10' },
        { label: 'In Progress', value: bookingStats.inProgress, Icon: SparklesIcon, accent: 'border-l-yellow-500', valueColor: 'text-yellow-400', iconColor: 'text-yellow-400 bg-yellow-500/10' },
        { label: 'Completed', value: bookingStats.completed, Icon: CheckCircleIcon, accent: 'border-l-green-500', valueColor: 'text-green-400', iconColor: 'text-green-400 bg-green-500/10' }
    ];

    const renderBooking = (booking: CarWashBooking) => {
        const customer = state.customers.find(c => c.id === booking.customer_id);
        const vehicle = state.vehicles.find(v => v.id === booking.vehicle_id);
        // Walk-in bookings store the typed name in customer_id
        const customerName = customer?.name || booking.customer_id || 'Unknown';

        return (
            <div
                key={booking.id}
                className={`rounded-lg border border-white/10 border-l-4 ${getServiceAccent(booking.service_type)} bg-dark-50/60 p-3`}
            >
                <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white break-words">{customerName}</p>
                        {vehicle && (
                            <p className="text-xs text-white/60 break-words">{vehicle.make} {vehicle.model}</p>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                    <span className={`w-2.5 h-2.5 flex-shrink-0 rounded-full bg-gradient-to-br ${getServiceColor(booking.service_type)}`}></span>
                    <span className="min-w-0 break-words">{booking.service_type} • {booking.duration}min</span>
                </div>

                {booking.notes && (
                    <p className="mt-2 text-xs text-white/70 italic break-words border-t border-white/10 pt-2">
                        "{booking.notes}"
                    </p>
                )}

                {/* Status + delete (always visible so they work on touch screens too) */}
                <div className="mt-3 flex items-center gap-2">
                    <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking, e.target.value as CarWashBooking['status'])}
                        aria-label={`Status for ${customerName}`}
                        className={`h-10 sm:h-9 min-w-0 flex-1 cursor-pointer rounded-lg border px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${getStatusColor(booking.status)}`}
                    >
                        <option value="Scheduled" className="bg-dark-50 text-white">Scheduled</option>
                        <option value="In Progress" className="bg-dark-50 text-white">In Progress</option>
                        <option value="Completed" className="bg-dark-50 text-white">Completed</option>
                        <option value="Cancelled" className="bg-dark-50 text-white">Cancelled</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => deleteBooking(booking.id)}
                        aria-label={`Delete booking for ${customerName}`}
                        title="Delete booking"
                        className="flex h-10 w-10 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                        <CarWashIcon className="h-6 w-6 flex-shrink-0 text-primary-500" />
                        Car Wash Scheduling
                    </h1>
                    <p className="text-sm text-white/60 mt-1">Schedule and manage car wash appointments</p>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleDateChange(-1)}
                        aria-label="Previous day"
                        className="flex h-11 w-11 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-dark-50/50 border border-primary-500/20 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        aria-label="Select date"
                        className="form-input h-11 sm:h-10 min-w-0 flex-1 sm:flex-none sm:w-44 px-3 text-sm text-center [color-scheme:dark]"
                    />

                    <button
                        type="button"
                        onClick={() => handleDateChange(1)}
                        aria-label="Next day"
                        className="flex h-11 w-11 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-dark-50/50 border border-primary-500/20 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statTiles.map(({ label, value, Icon, accent, valueColor, iconColor }) => (
                    <div key={label} className={`card-luxury p-3 sm:p-4 border-l-4 ${accent}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wide text-white/60 whitespace-nowrap">{label}</p>
                                <p className={`text-xl sm:text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
                            </div>
                            <div className={`hidden sm:block p-2.5 rounded-xl flex-shrink-0 ${iconColor}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Schedule: selected date + time slots */}
            <div className="card-luxury overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-primary-500/10">
                    <h2 className="text-base sm:text-lg font-semibold text-white break-words">{formatDate(selectedDate)}</h2>
                    <p className="text-sm text-white/60 mt-1">
                        {isToday ? 'Today' : isPast ? 'Past Date' : 'Future Date'}
                        {' • '}
                        {bookingStats.todaysBookings === 0
                            ? 'No bookings on this day. Click an available slot to create one.'
                            : `${bookingStats.todaysBookings} booking${bookingStats.todaysBookings !== 1 ? 's' : ''} scheduled. Click an available slot to create a new booking.`}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 items-start gap-2 sm:gap-3 p-3 sm:p-6">
                    {timeSlots.map(timeSlot => {
                        const bookings = getBookingsForSlot(timeSlot);

                        return (
                            <div key={timeSlot} className="flex items-start gap-3 rounded-lg border border-primary-500/10 p-2.5 sm:p-3 hover:border-primary-500/30 transition-colors">
                                {/* Time */}
                                <div className="flex h-10 w-[4.5rem] flex-shrink-0 items-center gap-1.5">
                                    <ClockIcon className="w-4 h-4 flex-shrink-0 text-primary-500" />
                                    <span className="text-sm font-semibold text-white tabular-nums">{timeSlot}</span>
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    {bookings.length > 0 ? (
                                        bookings.map(renderBooking)
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openBookingModal(timeSlot)}
                                            aria-label={`Book car wash at ${timeSlot}`}
                                            className="flex h-11 sm:h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary-500/20 text-xs font-medium text-primary-500/70 hover:text-primary-500 hover:bg-primary-500/10 hover:border-primary-500/40 transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Available
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Service Type Legend */}
            <div className="card-luxury p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Service Types</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                    {[
                        { type: 'Basic Wash', color: 'from-blue-500 to-blue-600', price: '₹500', duration: '30min' },
                        { type: 'Premium Wash', color: 'from-purple-500 to-purple-600', price: '₹800', duration: '45min' },
                        { type: 'Full Detail', color: 'from-green-500 to-green-600', price: '₹1500', duration: '2hrs' },
                        { type: 'Interior Only', color: 'from-orange-500 to-orange-600', price: '₹600', duration: '1hr' },
                        { type: 'Exterior Only', color: 'from-red-500 to-red-600', price: '₹400', duration: '30min' }
                    ].map((service) => (
                        <div key={service.type} className="flex items-center gap-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                            <div className={`w-3 h-3 flex-shrink-0 bg-gradient-to-br ${service.color} rounded-full`}></div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white break-words">{service.type}</p>
                                <p className="text-xs text-white/60">{service.price} • {service.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            <Modal title={`Book Car Wash - ${selectedTimeSlot}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <p className="text-sm text-white/60">{formatDate(selectedDate)} at {selectedTimeSlot}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Registered Customer
                            </label>
                            <select
                                value={newBooking.customer_id}
                                onChange={(e) => setNewBooking({ ...newBooking, customer_id: e.target.value, vehicle_id: '', walk_in_name: '' })}
                                className="form-input w-full px-3 py-2.5 text-sm"
                            >
                                <option value="">— Select or use Walk-in below —</option>
                                {state.customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Walk-in Name <span className="text-white/50 text-xs">(if not registered)</span>
                            </label>
                            <input
                                type="text"
                                value={newBooking.walk_in_name}
                                onChange={(e) => setNewBooking({ ...newBooking, walk_in_name: e.target.value, customer_id: '' })}
                                className="form-input w-full px-3 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="e.g. Rahul Kumar"
                                disabled={!!newBooking.customer_id}
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Vehicle <span className="text-white/50 text-xs">(optional)</span>
                            </label>
                            <select
                                value={newBooking.vehicle_id}
                                onChange={(e) => setNewBooking({ ...newBooking, vehicle_id: e.target.value })}
                                className="form-input w-full px-3 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!newBooking.customer_id}
                            >
                                <option value="">— No vehicle / not linked —</option>
                                {customerVehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Service Type *</label>
                            <select
                                value={newBooking.service_type}
                                onChange={(e) => setNewBooking({ ...newBooking, service_type: e.target.value as CarWashBooking['service_type'] })}
                                className="form-input w-full px-3 py-2.5 text-sm"
                                required
                            >
                                <option value="Basic Wash">Basic Wash (₹500)</option>
                                <option value="Premium Wash">Premium Wash (₹800)</option>
                                <option value="Full Detail">Full Detail (₹1500)</option>
                                <option value="Interior Only">Interior Only (₹600)</option>
                                <option value="Exterior Only">Exterior Only (₹400)</option>
                            </select>
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Duration (minutes) *</label>
                            <input
                                type="number"
                                value={newBooking.duration}
                                onChange={(e) => setNewBooking({ ...newBooking, duration: Number(e.target.value) })}
                                className="form-input w-full px-3 py-2.5 text-sm"
                                min="15"
                                max="180"
                                step="15"
                                required
                            />
                        </div>

                        <div className="min-w-0 sm:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Special Instructions</label>
                            <textarea
                                value={newBooking.notes}
                                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                                className="form-input w-full px-3 py-2.5 text-sm h-20 resize-none"
                                placeholder="Any special requests or notes..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-luxury px-6 py-2.5 rounded-xl"
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
