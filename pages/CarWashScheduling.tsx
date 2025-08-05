import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { CarWashBooking } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';

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

    // Generate time slots from 6 AM to 6 PM
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 6; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, []);

    // Get bookings for the selected date
    const dayBookings = useMemo(() => {
        const filtered = (state.carwashBookings || []).filter(booking => booking.date === selectedDate);
        console.log('Bookings for', selectedDate, ':', filtered);
        return filtered;
    }, [state.carwashBookings, selectedDate]);

    // Get customer vehicles for selected customer
    const customerVehicles = useMemo(() => {
        if (!newBooking.customer_id) return [];
        return state.vehicles.filter(v => v.owner_id === newBooking.customer_id);
    }, [newBooking.customer_id, state.vehicles]);

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
        // Handle both "07:00" and "07:00:00" formats
        const booking = dayBookings.find(booking => {
            const storedTime = booking.time_slot;
            const slotTime = timeSlot;
            
            // Check exact match first
            if (storedTime === slotTime) return true;
            
            // Check if stored time has seconds and slot doesn't
            if (storedTime === slotTime + ':00') return true;
            
            // Check if slot has seconds and stored doesn't
            if (storedTime + ':00' === slotTime) return true;
            
            return false;
        });
        
        console.log(`Looking for booking at ${timeSlot}, found:`, booking);
        console.log('All bookings for today:', dayBookings.map(b => ({ time: b.time_slot, customer: b.customer_id })));
        
        return booking;
    };

    const getServiceColor = (serviceType: string) => {
        switch (serviceType) {
            case 'Basic Wash': return 'bg-blue-500';
            case 'Premium Wash': return 'bg-purple-500';
            case 'Full Detail': return 'bg-green-500';
            case 'Interior Only': return 'bg-orange-500';
            case 'Exterior Only': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: CarWashBooking['status']) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Car Wash Scheduling</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        ← Previous Day
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                        onClick={() => handleDateChange(1)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Next Day →
                    </button>
                </div>
            </div>

            {/* Date Display */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatDate(selectedDate)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} scheduled
                </p>
            </div>

            {/* Calendar Grid - Like your second image */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
                {/* Time slots */}
                <div className="divide-y dark:divide-gray-700">
                    {timeSlots.map(timeSlot => {
                        const booking = getBookingForSlot(timeSlot);
                        const customer = booking ? state.customers.find(c => c.id === booking.customer_id) : null;
                        const vehicle = booking ? state.vehicles.find(v => v.id === booking.vehicle_id) : null;

                        return (
                            <div key={timeSlot} className="flex">
                                {/* Time Label */}
                                <div className="w-20 py-4 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">
                                    {timeSlot}
                                </div>
                                
                                {/* Booking Area */}
                                <div className="flex-1 p-2 min-h-16">
                                    {booking ? (
                                        <div className={`${getServiceColor(booking.service_type)} text-white p-3 rounded-lg shadow-sm relative group hover:shadow-md transition-shadow`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm truncate">
                                                        {customer?.name || 'Unknown Customer'}
                                                    </div>
                                                    <div className="text-xs opacity-90 truncate">
                                                        {vehicle?.make} {vehicle?.model} • {booking.service_type}
                                                    </div>
                                                    <div className="text-xs opacity-75">
                                                        {booking.duration} min • {booking.status}
                                                    </div>
                                                </div>
                                                
                                                {/* Action buttons - show on hover */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => updateBookingStatus(booking, e.target.value as CarWashBooking['status'])}
                                                        className="text-xs bg-white text-gray-800 border rounded px-1 py-1"
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
                                                        className="text-white hover:text-red-200 p-1"
                                                        title="Delete booking"
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {booking.notes && (
                                                <div className="text-xs opacity-80 mt-1 italic">
                                                    &quot;{booking.notes}&quot;
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openBookingModal(timeSlot)}
                                            className="w-full h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 transition-all"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-1" />
                                            <span className="text-sm">Book {timeSlot}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Service Type Legend */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Service Types</h4>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Basic Wash</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span>Premium Wash</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Full Detail</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>Interior Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Exterior Only</span>
                    </div>
                </div>
            </div>

            {/* Debug Info - Temporary */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Selected Date: {selectedDate}</p>
                <p>Bookings found: {dayBookings.length}</p>
                {dayBookings.length > 0 && (
                    <div className="mt-1 space-y-1">
                        {dayBookings.map(b => (
                            <p key={b.id} className="text-xs">
                                Time: "{b.time_slot}" | Customer: {state.customers.find(c => c.id === b.customer_id)?.name} | Service: {b.service_type}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <Modal title={`Book Car Wash - ${selectedTimeSlot}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                        <select
                            value={newBooking.customer_id}
                            onChange={(e) => setNewBooking({ ...newBooking, customer_id: e.target.value, vehicle_id: '' })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="">Select Customer</option>
                            {state.customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
                        <select
                            value={newBooking.vehicle_id}
                            onChange={(e) => setNewBooking({ ...newBooking, vehicle_id: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                        <select
                            value={newBooking.service_type}
                            onChange={(e) => setNewBooking({ ...newBooking, service_type: e.target.value as CarWashBooking['service_type'] })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="Basic Wash">Basic Wash</option>
                            <option value="Premium Wash">Premium Wash</option>
                            <option value="Full Detail">Full Detail</option>
                            <option value="Interior Only">Interior Only</option>
                            <option value="Exterior Only">Exterior Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                        <input
                            type="number"
                            value={newBooking.duration}
                            onChange={(e) => setNewBooking({ ...newBooking, duration: Number(e.target.value) })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            min="15"
                            max="300"
                            step="15"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea
                            value={newBooking.notes}
                            onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={3}
                            placeholder="Any special instructions..."
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">
                            Book Appointment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CarWashScheduling;