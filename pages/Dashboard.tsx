import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import { UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon, CircleStackIcon, CurrencyDollarIcon } from '../components/Icons';
import { JobStatus, PaymentStatus } from '../types';

// Trend Arrow Icon
const TrendUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
);

const Dashboard = () => {
    const { state, formatCurrency } = useAppContext();
    
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
                revenue: revenue,
                target: 150000 // Example target in INR
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
            text: `Job card created: ${j.description.substring(0, 40)}...`,
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

    // Custom Tooltip Components
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-gold rounded-lg border border-primary-500/30 p-3 shadow-luxury">
                    <p className="text-white font-semibold">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-2xl glass-gold border border-primary-500/30 p-8">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gradient mb-2">Welcome back, Admin</h1>
                    <p className="text-white/80 text-lg">Here's what's happening at your garage today</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/20 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                    title="Total Customers" 
                    value={dashboardData.totalCustomers} 
                    icon={<UsersIcon className="h-8 w-8" />}
                    change="+12%"
                    changeType="positive"
                />
                <Card 
                    title="Active Jobs" 
                    value={dashboardData.jobsInProgress} 
                    icon={<WrenchScrewdriverIcon className="h-8 w-8" />}
                    change="+8%"
                    changeType="positive"
                    gradient
                />
                <Card 
                    title="Monthly Revenue" 
                    value={formatCurrency(dashboardData.revenueThisMonth)} 
                    icon={<CurrencyDollarIcon className="h-8 w-8" />}
                    change="+25%"
                    changeType="positive"
                />
                <Card 
                    title="Low Stock Alert" 
                    value={dashboardData.lowStockItems} 
                    icon={<CircleStackIcon className="h-8 w-8" />}
                    change={dashboardData.lowStockItems > 0 ? "Attention needed" : "All good"}
                    changeType={dashboardData.lowStockItems > 0 ? "negative" : "positive"}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Trend */}
                <div className="xl:col-span-2 card-luxury p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
                        <div className="flex items-center space-x-2 text-green-400">
                            <TrendUpIcon className="h-5 w-5" />
                            <span className="text-sm font-semibold">+25% vs last period</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={dashboardData.monthlyRevenue}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.1)" />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#FFD700" 
                                strokeWidth={3}
                                fill="url(#revenueGradient)"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="target" 
                                stroke="#ffffff" 
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Job Status Pie Chart */}
                <div className="card-luxury p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Job Status Overview</h3>
                    <ResponsiveContainer width="100%" height={320}>
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
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Summary */}
                <div className="card-luxury p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Financial Summary</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dashboardData.financialSummaryData} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.1)" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="income" fill="#34D399" name="Income" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payroll" fill="#F87171" name="Payroll" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" fill="#FFD700" name="Profit" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="card-luxury p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                        {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map(activity => (
                            <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-4 p-3 rounded-xl bg-dark-50/30 border border-primary-500/10 hover:border-primary-500/30 transition-all duration-300">
                                <div className={`p-2 rounded-lg bg-dark-100/50 ${activity.color}`}>
                                    {activity.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white leading-relaxed">{activity.text}</p>
                                    <p className="text-xs text-primary-500/80 mt-1">
                                        {activity.date.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DocumentTextIcon className="w-8 h-8 text-primary-500/50" />
                                </div>
                                <p className="text-white/60">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(26, 26, 26, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #FFD700, #FFC107);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;