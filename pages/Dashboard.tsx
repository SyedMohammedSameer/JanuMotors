import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import { UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon, CircleStackIcon, CurrencyDollarIcon } from '../components/Icons';
import { JobStatus, PaymentStatus } from '../types';

const Dashboard = () => {
    const { state } = useAppContext();
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Memoized calculations for dashboard data
    const dashboardData = useMemo(() => {
        const totalCustomers = state.customers.length;
        const jobsInProgress = state.jobCards.filter(job => job.status === JobStatus.IN_PROGRESS).length;
        const lowStockItems = state.inventory.filter(item => item.quantity < item.low_stock_threshold).length;

        const revenueThisMonth = state.invoices
            .filter(inv => inv.payment_status === PaymentStatus.PAID && new Date(inv.issue_date).getMonth() === currentMonth && new Date(inv.issue_date).getFullYear() === currentYear)
            .reduce((sum, inv) => sum + inv.total, 0);
            
        const payrollThisMonth = state.payrollRecords
            .filter(p => p.month === currentMonth && p.year === currentYear)
            .reduce((sum, p) => sum + p.amount, 0);

        const jobStatusCounts = state.jobCards.reduce((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {} as Record<JobStatus, number>);

        const jobStatusData = Object.entries(jobStatusCounts).map(([name, value]) => ({ name, value }));
        
        const financialSummaryData = [{
            name: 'This Month',
            income: revenueThisMonth,
            payroll: payrollThisMonth
        }];
        
        // --- Unified Activity Feed ---
        const customerActivity = state.customers.map(c => ({
            id: c.id,
            type: 'customer',
            date: new Date(c.created_at),
            text: `New customer registered: ${c.name}`,
            icon: <UsersIcon className="h-5 w-5 text-blue-600" />
        }));

        const jobActivity = state.jobCards.map(j => ({
            id: j.id,
            type: 'job',
            date: new Date(j.created_at),
            text: `Job card created: ${j.description.substring(0, 40)}...`,
            icon: <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-600" />
        }));

        const invoiceActivity = state.invoices.filter(i => i.payment_status === PaymentStatus.PAID).map(i => ({
            id: i.id,
            type: 'invoice',
            date: new Date(i.issue_date),
            text: `Invoice #${i.id} paid for $${i.total.toFixed(2)}`,
            icon: <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
        }));

        const recentActivity = [...customerActivity, ...jobActivity, ...invoiceActivity]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);

        return {
            totalCustomers,
            jobsInProgress,
            lowStockItems,
            revenueThisMonth,
            jobStatusData,
            financialSummaryData,
            recentActivity
        };
    }, [state.customers, state.jobCards, state.invoices, state.inventory, state.payrollRecords, currentMonth, currentYear]);

    const JOB_STATUS_COLORS = {
        [JobStatus.PENDING]: '#FBBF24', // Amber 400
        [JobStatus.IN_PROGRESS]: '#60A5FA', // Blue 400
        [JobStatus.COMPLETED]: '#34D399', // Emerald 400
        [JobStatus.CANCELLED]: '#F87171', // Red 400
    };

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card title="Total Customers" value={dashboardData.totalCustomers} icon={<UsersIcon className="h-8 w-8 text-primary-500" />} />
                <Card title="Jobs In Progress" value={dashboardData.jobsInProgress} icon={<WrenchScrewdriverIcon className="h-8 w-8 text-primary-500" />} />
                <Card title="Revenue This Month" value={`$${dashboardData.revenueThisMonth.toFixed(2)}`} icon={<CurrencyDollarIcon className="h-8 w-8 text-primary-500" />} />
                <Card title="Low Stock Items" value={dashboardData.lowStockItems} icon={<CircleStackIcon className="h-8 w-8 text-primary-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Financials</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.financialSummaryData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                            <YAxis tick={{ fill: '#6b7280' }} unit="$" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: '#4b5563',
                                    color: '#ffffff'
                                }}
                                cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="income" fill="#34D399" name="Income" unit="$" />
                            <Bar dataKey="payroll" fill="#F87171" name="Payroll Expenses" unit="$" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Job Status Overview</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.jobStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {dashboardData.jobStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={JOB_STATUS_COLORS[entry.name as JobStatus] || '#808080'} />
                                ))}
                            </Pie>
                             <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: '#4b5563',
                                    color: '#ffffff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="mt-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
                     <ul className="space-y-4">
                        {dashboardData.recentActivity.map(activity => (
                            <li key={`${activity.type}-${activity.id}`} className="flex items-center space-x-4">
                               <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.text}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {activity.date.toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                         {dashboardData.recentActivity.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent activity.</p>
                        )}
                    </ul>
                </div>
        </div>
    );
};

export default Dashboard;