import React, { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon, CircleStackIcon, CurrencyDollarIcon, ArrowDownTrayIcon } from '../components/Icons';
import { JobStatus, PaymentStatus } from '../types';
import {
    exportAllData,
    prepareCustomersExport,
    prepareVehiclesExport,
    prepareJobCardsExport,
    prepareInvoicesExport,
    prepareInventoryExport,
    prepareServiceHistoryExport,
    prepareTransactionsExport,
    exportToCSV,
    exportToXLSX,
    getDateRange,
    filterByDateRange,
} from '../utils/exportData';

// Axis tick colour and compact INR formatter (lakh / crore) used by both charts
const AXIS_TICK = { fill: 'rgba(255,255,255,0.7)', fontSize: 12 };
const formatAxisCurrency = (value: number) => {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    const compact = (n: number, unit: string) => `${sign}₹${Number.isInteger(n) ? n : n.toFixed(1)}${unit}`;
    if (abs >= 1e7) return compact(abs / 1e7, 'Cr');
    if (abs >= 1e5) return compact(abs / 1e5, 'L');
    if (abs >= 1e3) return compact(abs / 1e3, 'K');
    return `${sign}₹${abs}`;
};

const Dashboard = () => {
    const { state, formatCurrency } = useAppContext();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
    const [exportPeriod, setExportPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
    const [isExporting, setIsExporting] = useState(false);
    
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

        // Revenue trend for last 6 months
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setDate(1); // avoid month overflow when today is the 29th-31st
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const revenue = state.invoices
                .filter(inv => inv.payment_status === PaymentStatus.PAID && 
                         new Date(inv.issue_date).getMonth() === month && 
                         new Date(inv.issue_date).getFullYear() === year)
                .reduce((sum, inv) => sum + inv.total, 0);
            
            monthlyRevenue.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                revenue: revenue
            });
        }

        const jobStatusCounts = state.jobCards.reduce((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {} as Record<JobStatus, number>);

        const jobStatusData = Object.entries(jobStatusCounts).map(([name, value]) => ({ name, value }));
        
        const financialSummaryData = [{
            name: 'This Month',
            income: revenueThisMonth,
            payroll: payrollThisMonth,
            profit: revenueThisMonth - payrollThisMonth
        }];
        
        // Recent Activity
        const customerActivity = state.customers.slice(-3).map(c => ({
            id: c.id,
            type: 'customer',
            date: new Date(c.created_at),
            text: `New customer registered: ${c.name}`,
            icon: <UsersIcon className="h-5 w-5" />,
            color: 'text-blue-400'
        }));

        const jobActivity = state.jobCards.slice(-3).map(j => ({
            id: j.id,
            type: 'job',
            date: new Date(j.created_at),
            text: `Job card created: ${j.description.substring(0, 40)}${j.description.length > 40 ? '...' : ''}`,
            icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
            color: 'text-primary-500'
        }));

        const invoiceActivity = state.invoices.filter(i => i.payment_status === PaymentStatus.PAID).slice(-3).map(i => ({
            id: i.id,
            type: 'invoice',
            date: new Date(i.issue_date),
            text: `Invoice #${i.id} paid for ${formatCurrency(i.total)}`,
            icon: <CurrencyDollarIcon className="h-5 w-5" />,
            color: 'text-green-400'
        }));

        const recentActivity = [...customerActivity, ...jobActivity, ...invoiceActivity]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 6);

        return {
            totalCustomers,
            jobsInProgress,
            lowStockItems,
            revenueThisMonth,
            monthlyRevenue,
            jobStatusData,
            financialSummaryData,
            recentActivity
        };
    }, [state.customers, state.jobCards, state.invoices, state.inventory, state.payrollRecords, currentMonth, currentYear, formatCurrency]);

    const JOB_STATUS_COLORS = {
        [JobStatus.PENDING]: '#FFD700',
        [JobStatus.IN_PROGRESS]: '#60A5FA',
        [JobStatus.COMPLETED]: '#34D399',
        [JobStatus.CANCELLED]: '#F87171',
    };

    // Custom Tooltip (currency by default; job counts for the pie chart)
    const CustomTooltip = ({ active, payload, label, isCurrency = true }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-primary-500/30 bg-dark-50 p-3 shadow-luxury">
                    {label !== undefined && <p className="text-sm font-semibold text-white mb-1">{label}</p>}
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm tabular-nums" style={{ color: entry.payload?.fill || entry.color }}>
                            {entry.name}: {!isCurrency ? entry.value : entry.value < 0 ? `-${formatCurrency(-entry.value)}` : formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const totalJobs = dashboardData.jobStatusData.reduce((sum, d) => sum + d.value, 0);
    const hasRevenue = dashboardData.monthlyRevenue.some(m => m.revenue > 0);
    const { financialSummaryData } = dashboardData;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            
            if (exportPeriod === 'all') {
                // Export all data
                await exportAllData(
                    state.customers,
                    state.vehicles,
                    state.jobCards,
                    state.invoices,
                    state.inventory,
                    state.workers,
                    exportFormat
                );
            } else {
                // Export specific period
                const { startDate, endDate } = getDateRange(exportPeriod as 'weekly' | 'monthly');
                
                const data = [
                    { name: 'Customers', data: prepareCustomersExport(state.customers, state.vehicles, state.invoices), filename: `customers_${exportPeriod}_${timestamp}` },
                    { name: 'Invoices', data: filterByDateRange(prepareInvoicesExport(state.invoices, state.customers, state.jobCards), 'Issue Date', startDate, endDate), filename: `invoices_${exportPeriod}_${timestamp}` },
                    { name: 'Job Cards', data: filterByDateRange(prepareJobCardsExport(state.jobCards, state.customers, state.vehicles, state.workers), 'Created Date', startDate, endDate), filename: `job_cards_${exportPeriod}_${timestamp}` },
                    { name: 'Service History', data: filterByDateRange(prepareServiceHistoryExport(state.customers), 'Service Date', startDate, endDate), filename: `service_history_${exportPeriod}_${timestamp}` },
                    { name: 'Transactions', data: filterByDateRange(prepareTransactionsExport(state.invoices, state.customers), 'Date', startDate, endDate), filename: `transactions_${exportPeriod}_${timestamp}` },
                    { name: 'Inventory', data: prepareInventoryExport(state.inventory), filename: `inventory_${exportPeriod}_${timestamp}` },
                ];
                
                for (const exp of data) {
                    if (exp.data.length > 0) {
                        if (exportFormat === 'xlsx') {
                            await exportToXLSX(exp.data, exp.filename);
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } else {
                            exportToCSV(exp.data, exp.filename);
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                    }
                }
            }
            
            alert('Data exported successfully!');
            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, Admin</h1>
                    <p className="text-sm text-white/60">Here's what's happening at your garage today</p>
                </div>
                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="btn-luxury w-full sm:w-auto px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap text-sm flex-shrink-0"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export Data</span>
                </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <Card
                    title="Total Customers"
                    value={dashboardData.totalCustomers}
                    icon={<UsersIcon className="h-6 w-6" />}
                />
                <Card
                    title="Active Jobs"
                    value={dashboardData.jobsInProgress}
                    icon={<WrenchScrewdriverIcon className="h-6 w-6" />}
                    gradient
                />
                <Card
                    title="Monthly Revenue"
                    value={formatCurrency(dashboardData.revenueThisMonth)}
                    icon={<CurrencyDollarIcon className="h-6 w-6" />}
                />
                {/* Low-stock status chip is overlaid here because Card always appends "vs last month" to its change text */}
                <div className="relative min-w-0">
                    <Card
                        title="Low Stock Alert"
                        value={dashboardData.lowStockItems}
                        icon={<CircleStackIcon className="h-6 w-6" />}
                    />
                    <span
                        className={`absolute top-4 right-4 sm:top-5 sm:right-5 z-20 pointer-events-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                            dashboardData.lowStockItems > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                        }`}
                    >
                        {dashboardData.lowStockItems > 0 ? (
                            <>
                                <span className="sm:hidden">Attention</span>
                                <span className="hidden sm:inline">Attention needed</span>
                            </>
                        ) : 'All good'}
                    </span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Revenue Trend */}
                <div className="xl:col-span-2 min-w-0 flex flex-col card-luxury p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-x-3 gap-y-1 flex-wrap mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Revenue Trend</h3>
                        <span className="text-xs text-white/60">Paid invoices, last 6 months</span>
                    </div>
                    <div className="relative flex-1 min-h-[16rem] sm:min-h-[20rem] w-full">
                        <div className="absolute inset-0">
                        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 240 }}>
                            <AreaChart data={dashboardData.monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.1)" />
                                <XAxis
                                    dataKey="month"
                                    tick={AXIS_TICK}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    width={56}
                                    tick={AXIS_TICK}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    domain={hasRevenue ? [0, 'auto'] : [0, 1000]}
                                    tickFormatter={formatAxisCurrency}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke="#FFD700"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                        {!hasRevenue && (
                            <div className="absolute inset-0 pl-14 flex items-center justify-center pointer-events-none">
                                <p className="text-sm text-white/60 text-center px-6">No paid invoices in the last 6 months</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Status Pie Chart */}
                <div className="min-w-0 card-luxury p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Job Status Overview</h3>
                    {dashboardData.jobStatusData.length > 0 ? (
                        <>
                            <div className="relative h-48 sm:h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 240 }}>
                                    <PieChart>
                                        <Pie
                                            data={dashboardData.jobStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="58%"
                                            outerRadius="90%"
                                            paddingAngle={2}
                                            stroke="none"
                                            dataKey="value"
                                        >
                                            {dashboardData.jobStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={JOB_STATUS_COLORS[entry.name as JobStatus] || '#808080'} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip isCurrency={false} />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-white tabular-nums">{totalJobs}</span>
                                    <span className="text-xs text-white/60">{totalJobs === 1 ? 'Job' : 'Jobs'}</span>
                                </div>
                            </div>
                            <ul className="mt-4 mx-auto w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-8 gap-y-2">
                                {dashboardData.jobStatusData.map(entry => (
                                    <li key={entry.name} className="flex items-center gap-2 text-sm min-w-0">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: JOB_STATUS_COLORS[entry.name as JobStatus] || '#808080' }}
                                        ></span>
                                        <span className="flex-1 min-w-0 text-white/80 break-words">{entry.name}</span>
                                        <span className="text-white/60 tabular-nums whitespace-nowrap">
                                            {entry.value} <span className="text-white/50">({Math.round((entry.value / totalJobs) * 100)}%)</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="flex h-48 sm:h-56 items-center justify-center">
                            <p className="text-sm text-white/60">No job cards yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Financial Summary */}
                <div className="min-w-0 flex flex-col card-luxury p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-x-3 gap-y-1 flex-wrap mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Financial Summary</h3>
                        <span className="text-xs text-white/60">This month</span>
                    </div>
                    <dl className="space-y-2 mb-4">
                        {[
                            { label: 'Income', color: '#34D399', value: financialSummaryData[0].income },
                            { label: 'Payroll', color: '#F87171', value: financialSummaryData[0].payroll },
                            { label: 'Profit', color: '#FFD700', value: financialSummaryData[0].profit },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between gap-3">
                                <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                                    {item.label}
                                </dt>
                                <dd className="text-sm sm:text-base font-semibold text-white tabular-nums whitespace-nowrap">
                                    {item.value < 0 ? `-${formatCurrency(-item.value)}` : formatCurrency(item.value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="relative flex-1 min-h-[14rem] sm:min-h-[16rem] w-full">
                        <div className="absolute inset-0">
                        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 240 }}>
                            <BarChart data={financialSummaryData} barCategoryGap="20%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    tick={AXIS_TICK}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    width={56}
                                    tick={AXIS_TICK}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    tickFormatter={formatAxisCurrency}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="income" fill="#34D399" name="Income" radius={[4, 4, 0, 0]} maxBarSize={56} />
                                <Bar dataKey="payroll" fill="#F87171" name="Payroll" radius={[4, 4, 0, 0]} maxBarSize={56} />
                                <Bar dataKey="profit" fill="#FFD700" name="Profit" radius={[4, 4, 0, 0]} maxBarSize={56} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="min-w-0 card-luxury p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Recent Activity</h3>
                    <div className="space-y-3">
                        {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map(activity => (
                            <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-dark-50/30 border border-primary-500/10 hover:border-primary-500/30 transition-colors">
                                <div className={`p-2 flex-shrink-0 rounded-lg bg-dark-100/50 ${activity.color}`}>
                                    {activity.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white break-words">{activity.text}</p>
                                    <p className="text-xs text-primary-500/80 mt-1">
                                        {activity.date.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <DocumentTextIcon className="w-6 h-6 text-primary-500/50" />
                                </div>
                                <p className="text-sm text-white/60">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal title="Export Garage Data" isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Export Format</label>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 sm:py-1">
                                <input
                                    type="radio"
                                    name="format"
                                    value="csv"
                                    checked={exportFormat === 'csv'}
                                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                                    className="h-4 w-4 flex-shrink-0 accent-primary-500"
                                />
                                <span className="text-sm text-white">CSV (Excel Compatible)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 sm:py-1">
                                <input
                                    type="radio"
                                    name="format"
                                    value="xlsx"
                                    checked={exportFormat === 'xlsx'}
                                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                                    className="h-4 w-4 flex-shrink-0 accent-primary-500"
                                />
                                <span className="text-sm text-white">XLSX (Excel Format)</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Time Period</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 sm:py-1">
                                <input
                                    type="radio"
                                    name="period"
                                    value="all"
                                    checked={exportPeriod === 'all'}
                                    onChange={(e) => setExportPeriod(e.target.value as 'all' | 'weekly' | 'monthly')}
                                    className="h-4 w-4 flex-shrink-0 accent-primary-500"
                                />
                                <span className="text-sm text-white">All Data</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 sm:py-1">
                                <input
                                    type="radio"
                                    name="period"
                                    value="weekly"
                                    checked={exportPeriod === 'weekly'}
                                    onChange={(e) => setExportPeriod(e.target.value as 'all' | 'weekly' | 'monthly')}
                                    className="h-4 w-4 flex-shrink-0 accent-primary-500"
                                />
                                <span className="text-sm text-white">Last 7 Days</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 sm:py-1">
                                <input
                                    type="radio"
                                    name="period"
                                    value="monthly"
                                    checked={exportPeriod === 'monthly'}
                                    onChange={(e) => setExportPeriod(e.target.value as 'all' | 'weekly' | 'monthly')}
                                    className="h-4 w-4 flex-shrink-0 accent-primary-500"
                                />
                                <span className="text-sm text-white">Last 30 Days</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                        <p className="text-sm text-white/80">
                            📊 <strong>What will be exported:</strong> Customers, vehicles, job cards, invoices, inventory, service history, and transaction reports.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsExportModalOpen(false)}
                            className="btn-secondary px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="btn-luxury px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
