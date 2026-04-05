import { Customer, Vehicle, JobCard, Invoice, InventoryItem, ServiceHistory, PaymentStatus, JobStatus } from '../types';

// CSV Export
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
                if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// XLSX Export (using html2canvas and jsPDF or simpler approach)
export const exportToXLSX = async (data: any[], filename: string) => {
    try {
        // Try to use XLSX if available, otherwise use CSV fallback
        if (typeof (window as any).XLSX !== 'undefined') {
            const XLSX = (window as any).XLSX;
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
            XLSX.writeFile(workbook, `${filename}.xlsx`);
        } else {
            // Fallback: Create HTML table and offer as alternative download
            console.warn('XLSX library not available, using CSV format instead');
            exportToCSV(data, filename);
        }
    } catch (error) {
        console.error('XLSX export error:', error);
        exportToCSV(data, filename);
    }
};

// Format data for export
export const prepareCustomersExport = (customers: Customer[], vehicles: Vehicle[], invoices: Invoice[]): any[] => {
    return customers.map(customer => {
        const customerVehicles = vehicles.filter(v => v.owner_id === customer.id);
        const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
        const totalSpent = customerInvoices.reduce((sum, inv) => sum + (inv.payment_status === PaymentStatus.PAID ? inv.total : 0), 0);
        
        return {
            'Customer ID': customer.id,
            'Name': customer.name,
            'Phone': customer.phone,
            'Email': customer.email,
            'Address': customer.address,
            'VIP Coupon ID': customer.coupon_id || '',
            'Vehicles Count': customerVehicles.length,
            'Service History Count': customer.service_history.length,
            'Total Spent': totalSpent.toFixed(2),
            'Member Since': new Date(customer.created_at).toLocaleDateString(),
        };
    });
};

export const prepareVehiclesExport = (vehicles: Vehicle[], customers: Customer[]): any[] => {
    return vehicles.map(vehicle => {
        const owner = customers.find(c => c.id === vehicle.owner_id);
        return {
            'Vehicle ID': vehicle.id,
            'Owner Name': owner?.name || 'N/A',
            'Owner Phone': owner?.phone || 'N/A',
            'Make': vehicle.make,
            'Model': vehicle.model,
            'Year': vehicle.year,
            'License Plate': vehicle.license_plate,
            'VIN': vehicle.vin,
        };
    });
};

export const prepareJobCardsExport = (jobCards: JobCard[], customers: Customer[], vehicles: Vehicle[], workers: any[]): any[] => {
    return jobCards.map(job => {
        const customer = customers.find(c => c.id === job.customer_id);
        const vehicle = vehicles.find(v => v.id === job.vehicle_id);
        const worker = workers.find(w => w.id === job.assigned_to);
        
        return {
            'Job Card ID': job.id,
            'Customer': customer?.name || 'N/A',
            'Vehicle': vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A',
            'Description': job.description,
            'Status': job.status,
            'Assigned To': worker?.name || 'N/A',
            'Labor Hours': job.labor_hours,
            'Parts Count': job.parts_used.length,
            'Created Date': new Date(job.created_at).toLocaleDateString(),
            'Completed Date': job.completed_date ? new Date(job.completed_date).toLocaleDateString() : 'Pending',
        };
    });
};

export const prepareInvoicesExport = (invoices: Invoice[], customers: Customer[], jobCards: JobCard[]): any[] => {
    return invoices.map(invoice => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        const job = jobCards.find(j => j.id === invoice.job_card_id);
        
        return {
            'Invoice ID': invoice.id,
            'Customer': customer?.name || 'N/A',
            'Job Card ID': invoice.job_card_id,
            'Issue Date': invoice.issue_date,
            'Due Date': invoice.due_date,
            'Subtotal': invoice.subtotal.toFixed(2),
            'Tax': invoice.tax.toFixed(2),
            'Discount': (invoice.discount || 0).toFixed(2),
            'Total': invoice.total.toFixed(2),
            'Payment Status': invoice.payment_status,
            'Payment Method': invoice.payment_method || 'N/A',
            'Items Count': invoice.items.length,
        };
    });
};

export const prepareInventoryExport = (inventory: InventoryItem[]): any[] => {
    return inventory.map(item => ({
        'Item ID': item.id,
        'Name': item.name,
        'SKU': item.sku,
        'Quantity': item.quantity,
        'Low Stock Threshold': item.low_stock_threshold,
        'Price': item.price.toFixed(2),
        'Total Value': (item.quantity * item.price).toFixed(2),
        'Supplier': item.supplier,
        'Stock Status': item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.low_stock_threshold ? 'Low Stock' : 'In Stock',
    }));
};

export const prepareServiceHistoryExport = (customers: Customer[]): any[] => {
    const allServices: any[] = [];
    
    customers.forEach(customer => {
        customer.service_history.forEach(service => {
            allServices.push({
                'Customer': customer.name,
                'Service Date': new Date(service.date).toLocaleDateString(),
                'Description': service.description,
                'Cost': service.cost.toFixed(2),
                'Service ID': service.id,
            });
        });
    });
    
    return allServices.sort((a, b) => new Date(b['Service Date']).getTime() - new Date(a['Service Date']).getTime());
};

export const prepareTransactionsExport = (invoices: Invoice[], customers: Customer[]): any[] => {
    return invoices.map(invoice => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        return {
            'Transaction ID': invoice.id,
            'Type': 'Invoice',
            'Customer': customer?.name || 'N/A',
            'Amount': invoice.total.toFixed(2),
            'Date': invoice.issue_date,
            'Status': invoice.payment_status,
            'Payment Method': invoice.payment_method || 'N/A',
            'Notes': `${invoice.items.length} items`,
        };
    }).sort((a, b) => new Date(b['Date']).getTime() - new Date(a['Date']).getTime());
};

// Get date range for filtering
export const getDateRange = (period: 'weekly' | 'monthly'): { startDate: Date; endDate: Date } => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'weekly') {
        startDate.setDate(endDate.getDate() - 7);
    } else if (period === 'monthly') {
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    return { startDate, endDate };
};

// Filter data by date range
export const filterByDateRange = (data: any[], dateField: string, startDate: Date, endDate: Date): any[] => {
    return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= startDate && itemDate <= endDate;
    });
};

// Comprehensive export with all data
export const exportAllData = async (
    customers: Customer[],
    vehicles: Vehicle[],
    jobCards: JobCard[],
    invoices: Invoice[],
    inventory: InventoryItem[],
    workers: any[],
    format: 'csv' | 'xlsx' = 'csv'
) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const exports = [
        {
            data: prepareCustomersExport(customers, vehicles, invoices),
            filename: `customers_${timestamp}`,
        },
        {
            data: prepareVehiclesExport(vehicles, customers),
            filename: `vehicles_${timestamp}`,
        },
        {
            data: prepareJobCardsExport(jobCards, customers, vehicles, workers),
            filename: `job_cards_${timestamp}`,
        },
        {
            data: prepareInvoicesExport(invoices, customers, jobCards),
            filename: `invoices_${timestamp}`,
        },
        {
            data: prepareInventoryExport(inventory),
            filename: `inventory_${timestamp}`,
        },
        {
            data: prepareServiceHistoryExport(customers),
            filename: `service_history_${timestamp}`,
        },
        {
            data: prepareTransactionsExport(invoices, customers),
            filename: `transactions_${timestamp}`,
        },
    ];
    
    for (const exp of exports) {
        if (format === 'xlsx') {
            await exportToXLSX(exp.data, exp.filename);
            // Add delay between exports to avoid browser throttling
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            exportToCSV(exp.data, exp.filename);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
};
