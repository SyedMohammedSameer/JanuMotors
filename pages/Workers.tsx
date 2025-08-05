import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Worker, AttendanceRecord } from '../types';
import { PencilSquareIcon, UserGroupIcon, PlusIcon } from '../components/Icons';

// Clock Icons
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

// Badge Icons for roles
const WrenchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.664 1.208-.766M11.42 15.17l-4.66-4.66C4.562 8.306 4.562 5.09 6.89 2.763c2.328-2.328 5.544-2.328 7.872 0l4.66 4.66M11.42 15.17L5.75 21a2.652 2.652 0 01-3.75-3.75l5.877-5.877m0 0l2.496-3.03c.317-.384.74-.664 1.208-.766" />
    </svg>
);

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
);

const DailyPayInput = ({ record, initialPay }: { record: AttendanceRecord, initialPay?: number }) => {
    const { dispatch } = useAppContext();
    const [pay, setPay] = useState(initialPay || '');

    useEffect(() => {
        setPay(initialPay || '');
    }, [initialPay]);

    const handleBlur = () => {
        const amount = parseFloat(pay.toString());
        const finalPay = !isNaN(amount) && amount >= 0 ? amount : undefined;
        
        const updatedRecord: AttendanceRecord = {
            ...record,
            daily_pay: finalPay
        };

        dispatch({ type: 'UPDATE_ATTENDANCE', payload: updatedRecord });
    };
    
    return (
        <input
            type="number"
            value={pay}
            onChange={e => setPay(e.target.value)}
            onBlur={handleBlur}
            placeholder="0.00"
            className="w-24 px-3 py-1 form-input text-sm rounded-lg text-center"
        />
    );
};

const Workers = () => {
    const { state, dispatch } = useAppContext();
    const [isClockModalOpen, setIsClockModalOpen] = useState(false);
    const [clockModalType, setClockModalType] = useState<'clock-in' | 'clock-out' | null>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
    const [currentWorker, setCurrentWorker] = useState<Partial<Worker> | null>(null);
    const workerRoles: Worker['role'][] = ['Mechanic', 'Receptionist', 'Manager'];

    const today = new Date().toISOString().split('T')[0];

    const todaysAttendance = useMemo(() => {
        return state.attendance.filter(a => a.date === today).sort((a,b) => new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime());
    }, [state.attendance, today]);

    const { workersToClockIn, workersToClockOut } = useMemo(() => {
        const currentlyClockedInIds = new Set(
            state.attendance
                .filter(a => a.date === today && !a.clock_out)
                .map(a => a.worker_id)
        );

        return {
            workersToClockIn: state.workers.filter(w => !currentlyClockedInIds.has(w.id)),
            workersToClockOut: state.workers.filter(w => currentlyClockedInIds.has(w.id)),
        };
    }, [state.workers, state.attendance, today]);

    const getRoleIcon = (role: Worker['role']) => {
        switch (role) {
            case 'Mechanic': return WrenchIcon;
            case 'Receptionist': return PhoneIcon;
            case 'Manager': return BriefcaseIcon;
            default: return UserGroupIcon;
        }
    };

    const getRoleColor = (role: Worker['role']) => {
        switch (role) {
            case 'Mechanic': return 'text-primary-500 bg-primary-500/10 border-primary-500/30';
            case 'Receptionist': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            case 'Manager': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
            default: return 'text-white/60 bg-white/10 border-white/30';
        }
    };

    const openClockModal = (type: 'clock-in' | 'clock-out') => {
        setClockModalType(type);
        setSelectedWorkerId('');
        setIsClockModalOpen(true);
    };

    const handleClockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkerId || !clockModalType) return;
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        if (clockModalType === 'clock-in') {
            const newRecord: AttendanceRecord = {
                id: `A${Date.now()}`,
                worker_id: selectedWorkerId,
                date: todayStr,
                clock_in: now.toISOString(),
            };
            await dispatch({ type: 'ADD_ATTENDANCE', payload: newRecord });
        } else {
            const recordToUpdate = state.attendance.find(
                a => a.worker_id === selectedWorkerId && a.date === todayStr && !a.clock_out
            );
            if (recordToUpdate) {
                const updatedRecord: AttendanceRecord = {
                    ...recordToUpdate,
                    clock_out: now.toISOString(),
                };
                await dispatch({ type: 'UPDATE_ATTENDANCE', payload: updatedRecord });
            }
        }
        setIsClockModalOpen(false);
    };

    const handleOpenWorkerModal = (worker: Worker | null) => {
        setCurrentWorker(worker ? { ...worker } : { name: '', role: 'Mechanic' });
        setIsWorkerModalOpen(true);
    };

    const handleCloseWorkerModal = () => {
        setIsWorkerModalOpen(false);
        setCurrentWorker(null);
    };

    const handleWorkerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (currentWorker) {
            setCurrentWorker({ ...currentWorker, [name]: value });
        }
    };
    
    const handleWorkerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorker || !currentWorker.name || !currentWorker.role) return;

        if (currentWorker.id) {
            await dispatch({ type: 'UPDATE_WORKER', payload: currentWorker as Worker });
        } else {
            const newWorker: Worker = {
                id: `W${Date.now()}`,
                name: currentWorker.name,
                role: currentWorker.role as Worker['role'],
            };
            await dispatch({ type: 'ADD_WORKER', payload: newWorker });
        }
        handleCloseWorkerModal();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <UserGroupIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Worker Management
                    </h1>
                    <p className="text-white/60 mt-2">Manage your team and track attendance</p>
                </div>
                
                <button
                    onClick={() => handleOpenWorkerModal(null)}
                    className="btn-luxury px-6 py-3 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add New Worker</span>
                </button>
            </div>

            {/* Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {state.workers.map(worker => {
                    const RoleIcon = getRoleIcon(worker.role);
                    const roleColor = getRoleColor(worker.role);
                    const todayAttendance = todaysAttendance.find(a => a.worker_id === worker.id);
                    const isActive = todayAttendance && !todayAttendance.clock_out;

                    return (
                        <div key={worker.id} className="card-luxury p-6 group">
                            {/* Worker Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black text-lg">
                                        {worker.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{worker.name}</h3>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                                            <RoleIcon className="w-3 h-3" />
                                            <span>{worker.role}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    {isActive && (
                                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs font-medium text-green-400">Active</span>
                                        </div>
                                    )}
                                    
                                    <button
                                        onClick={() => handleOpenWorkerModal(worker)}
                                        className="p-2 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all duration-300"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Today's Activity */}
                            <div className="space-y-3">
                                {todayAttendance ? (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Clock In</span>
                                            <span className="text-green-400 font-medium">
                                                {new Date(todayAttendance.clock_in).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">Clock Out</span>
                                            {todayAttendance.clock_out ? (
                                                <span className="text-red-400 font-medium">
                                                    {new Date(todayAttendance.clock_out).toLocaleTimeString()}
                                                </span>
                                            ) : (
                                                <span className="text-primary-500 font-medium animate-pulse">Active</span>
                                            )}
                                        </div>

                                        {todayAttendance.clock_out && (
                                            <>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-white/70">Hours Worked</span>
                                                    <span className="text-white font-medium">
                                                        {((new Date(todayAttendance.clock_out).getTime() - new Date(todayAttendance.clock_in).getTime()) / 3600000).toFixed(1)}h
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-white/70">Daily Pay</span>
                                                    <DailyPayInput record={todayAttendance} initialPay={todayAttendance.daily_pay} />
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <ClockIcon className="w-8 h-8 text-primary-500/50 mx-auto mb-2" />
                                        <p className="text-white/50 text-sm">Not clocked in today</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Clock In/Out Controls */}
            <div className="card-luxury p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <ClockIcon className="h-6 w-6 mr-3 text-primary-500" />
                    Attendance Control
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => openClockModal('clock-in')} 
                        disabled={workersToClockIn.length === 0}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Clock In ({workersToClockIn.length})</span>
                    </button>
                    
                    <button 
                        onClick={() => openClockModal('clock-out')} 
                        disabled={workersToClockOut.length === 0}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <StopIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Clock Out ({workersToClockOut.length})</span>
                    </button>
                </div>
            </div>

            {/* Today's Attendance Table */}
            <div className="card-luxury overflow-hidden">
                <div className="p-6 border-b border-primary-500/10">
                    <h3 className="text-xl font-bold text-white">Today's Attendance Summary</h3>
                    <p className="text-white/60">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-50/50">
                            <tr className="text-left text-sm font-semibold text-primary-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Worker</th>
                                <th className="px-6 py-4">Clock In</th>
                                <th className="px-6 py-4">Clock Out</th>
                                <th className="px-6 py-4">Hours</th>
                                <th className="px-6 py-4">Daily Pay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-500/10">
                            {todaysAttendance.length > 0 ? todaysAttendance.map(record => {
                                const worker = state.workers.find(w => w.id === record.worker_id);
                                if (!worker) return null;
                                
                                const clockInTime = new Date(record.clock_in);
                                const clockOutTime = record.clock_out ? new Date(record.clock_out) : null;
                                const hours = clockOutTime ? ((clockOutTime.getTime() - clockInTime.getTime()) / 3600000) : 0;

                                return (
                                    <tr key={record.id} className="hover:bg-primary-500/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black text-sm">
                                                    {worker.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{worker.name}</div>
                                                    <div className="text-xs text-primary-500/80">{worker.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white">{clockInTime.toLocaleTimeString()}</td>
                                        <td className="px-6 py-4">
                                            {clockOutTime ? (
                                                <span className="text-white">{clockOutTime.toLocaleTimeString()}</span>
                                            ) : (
                                                <span className="flex items-center space-x-2 text-green-400 font-semibold">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span>Active</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            {hours > 0 ? `${hours.toFixed(1)}h` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {clockOutTime ? (
                                                <DailyPayInput record={record} initialPay={record.daily_pay} />
                                            ) : (
                                                <span className="text-white/40 italic">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12">
                                        <ClockIcon className="w-12 h-12 text-primary-500/50 mx-auto mb-4" />
                                        <p className="text-white/60">No attendance records for today</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Clock Modal */}
            <Modal 
                title={clockModalType === 'clock-in' ? 'Clock In Worker' : 'Clock Out Worker'} 
                isOpen={isClockModalOpen} 
                onClose={() => setIsClockModalOpen(false)}
            >
                <form onSubmit={handleClockSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Select Worker</label>
                        <select
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            className="form-input w-full px-4 py-3"
                            required
                        >
                            <option value="">-- Select a Worker --</option>
                            {(clockModalType === 'clock-in' ? workersToClockIn : workersToClockOut).map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsClockModalOpen(false)} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!selectedWorkerId} 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            Confirm {clockModalType === 'clock-in' ? 'Clock In' : 'Clock Out'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            {/* Worker Modal */}
            <Modal 
                title={currentWorker?.id ? 'Edit Worker' : 'Add New Worker'} 
                isOpen={isWorkerModalOpen} 
                onClose={handleCloseWorkerModal}
            >
                <form onSubmit={handleWorkerSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Worker Name *</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={currentWorker?.name || ''} 
                            onChange={handleWorkerChange} 
                            placeholder="Enter worker's full name"
                            className="form-input w-full px-4 py-3" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Role *</label>
                        <select 
                            name="role" 
                            value={currentWorker?.role || ''} 
                            onChange={handleWorkerChange} 
                            className="form-input w-full px-4 py-3" 
                            required
                        >
                            {workerRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={handleCloseWorkerModal} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            {currentWorker?.id ? 'Update Worker' : 'Add Worker'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Workers;