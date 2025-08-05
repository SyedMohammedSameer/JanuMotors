import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { InventoryItem } from '../types';
import Modal from '../components/Modal';
import { PencilSquareIcon, TrashIcon, CircleStackIcon, PlusIcon } from '../components/Icons';

// Alert Icons
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Search Icon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

// Filter Icon
const FunnelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

const Inventory = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<InventoryItem> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

    const filteredInventory = useMemo(() => {
        let filtered = state.inventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (stockFilter) {
            case 'low':
                filtered = filtered.filter(item => item.quantity > 0 && item.quantity <= item.low_stock_threshold);
                break;
            case 'out':
                filtered = filtered.filter(item => item.quantity === 0);
                break;
            case 'good':
                filtered = filtered.filter(item => item.quantity > item.low_stock_threshold);
                break;
        }

        return filtered.sort((a, b) => {
            // Priority: Out of stock > Low stock > Good stock
            if (a.quantity === 0 && b.quantity > 0) return -1;
            if (a.quantity > 0 && b.quantity === 0) return 1;
            if (a.quantity <= a.low_stock_threshold && b.quantity > b.low_stock_threshold) return -1;
            if (a.quantity > a.low_stock_threshold && b.quantity <= b.low_stock_threshold) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [state.inventory, searchTerm, stockFilter]);

    const inventoryStats = useMemo(() => {
        const total = state.inventory.length;
        const lowStock = state.inventory.filter(item => item.quantity > 0 && item.quantity <= item.low_stock_threshold).length;
        const outOfStock = state.inventory.filter(item => item.quantity === 0).length;
        const totalValue = state.inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        return { total, lowStock, outOfStock, totalValue };
    }, [state.inventory]);

    const getStockStatus = (item: InventoryItem) => {
        if (item.quantity === 0) {
            return { status: 'out', color: 'bg-red-500', text: 'Out of Stock', icon: ExclamationTriangleIcon };
        } else if (item.quantity <= item.low_stock_threshold) {
            return { status: 'low', color: 'bg-yellow-500', text: 'Low Stock', icon: ExclamationTriangleIcon };
        } else {
            return { status: 'good', color: 'bg-green-500', text: 'In Stock', icon: CheckCircleIcon };
        }
    };
    
    const handleOpenModal = (item: InventoryItem | null) => {
        setCurrentItem(item ? { ...item } : { name: '', sku: '', quantity: 0, low_stock_threshold: 10, price: 0, supplier: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (currentItem) {
            setCurrentItem({
                ...currentItem,
                [name]: type === 'number' ? parseFloat(value) || 0 : value,
            });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem) return;

        if (currentItem.id) {
            await dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: currentItem as InventoryItem });
        } else {
            const newItem: InventoryItem = {
                ...currentItem,
                id: `I${Date.now()}`,
            } as InventoryItem;
            await dispatch({ type: 'ADD_INVENTORY_ITEM', payload: newItem });
        }
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            await dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: { id } });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <CircleStackIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Inventory Management
                    </h1>
                    <p className="text-white/60 mt-2">Track parts, supplies, and stock levels</p>
                </div>
                
                <button 
                    onClick={() => handleOpenModal(null)}
                    className="btn-luxury px-6 py-3 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add New Item</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-luxury p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Total Items</p>
                            <p className="text-2xl font-bold text-white">{inventoryStats.total}</p>
                        </div>
                        <CircleStackIcon className="h-8 w-8 text-primary-500" />
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Low Stock</p>
                            <p className="text-2xl font-bold text-yellow-400">{inventoryStats.lowStock}</p>
                        </div>
                        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-400">{inventoryStats.outOfStock}</p>
                        </div>
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Total Value</p>
                            <p className="text-2xl font-bold text-primary-400">${inventoryStats.totalValue.toLocaleString()}</p>
                        </div>
                        <div className="text-primary-500 text-3xl font-bold">$</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card-luxury p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50" />
                        <input
                            type="text"
                            placeholder="Search by name, SKU, or supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-12 pr-4 py-3"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-5 h-5 text-primary-500/50" />
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="form-input px-4 py-3 min-w-[140px]"
                        >
                            <option value="all">All Items</option>
                            <option value="good">In Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInventory.map(item => {
                    const stockInfo = getStockStatus(item);
                    return (
                        <div key={item.id} className="card-luxury p-6 group">
                            {/* Item Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-lg truncate">{item.name}</h3>
                                    <p className="text-primary-500/80 text-sm font-mono">{item.sku}</p>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="p-2 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all duration-300"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 ${
                                stockInfo.status === 'out' ? 'bg-red-500/10 border border-red-500/30' :
                                stockInfo.status === 'low' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                                'bg-green-500/10 border border-green-500/30'
                            }`}>
                                <div className={`w-3 h-3 ${stockInfo.color} rounded-full animate-pulse`}></div>
                                <span className={`text-sm font-medium ${
                                    stockInfo.status === 'out' ? 'text-red-400' :
                                    stockInfo.status === 'low' ? 'text-yellow-400' :
                                    'text-green-400'
                                }`}>
                                    {stockInfo.text}
                                </span>
                                <stockInfo.icon className={`w-4 h-4 ml-auto ${
                                    stockInfo.status === 'out' ? 'text-red-400' :
                                    stockInfo.status === 'low' ? 'text-yellow-400' :
                                    'text-green-400'
                                }`} />
                            </div>

                            {/* Quantity and Price */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Quantity</span>
                                    <span className="font-bold text-white">{item.quantity}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Unit Price</span>
                                    <span className="font-bold text-primary-400">${item.price.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Total Value</span>
                                    <span className="font-bold text-primary-400">${(item.quantity * item.price).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Low Stock Alert</span>
                                    <span className="text-sm text-white">{item.low_stock_threshold}</span>
                                </div>
                            </div>

                            {/* Supplier */}
                            {item.supplier && (
                                <div className="pt-4 border-t border-primary-500/10">
                                    <p className="text-xs text-white/50">Supplier</p>
                                    <p className="text-sm text-white/80 truncate">{item.supplier}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredInventory.length === 0 && (
                <div className="card-luxury p-12 text-center">
                    <div className="w-20 h-20 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CircleStackIcon className="w-10 h-10 text-primary-500/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Items Found</h3>
                    <p className="text-white/60 mb-6">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Start building your inventory'}
                    </p>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="btn-luxury px-6 py-3 rounded-xl"
                    >
                        Add First Item
                    </button>
                </div>
            )}

            {/* Add/Edit Item Modal */}
            <Modal title={currentItem?.id ? 'Edit Item' : 'Add New Item'} isOpen={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">Item Name *</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={currentItem?.name || ''} 
                                onChange={handleChange} 
                                placeholder="e.g., Engine Oil 5W-30"
                                className="form-input w-full px-4 py-3" 
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">SKU *</label>
                            <input 
                                type="text" 
                                name="sku" 
                                value={currentItem?.sku || ''} 
                                onChange={handleChange} 
                                placeholder="e.g., ENG-OIL-5W30"
                                className="form-input w-full px-4 py-3" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Supplier</label>
                            <input 
                                type="text" 
                                name="supplier" 
                                value={currentItem?.supplier || ''} 
                                onChange={handleChange} 
                                placeholder="e.g., Auto Parts Inc."
                                className="form-input w-full px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Current Quantity *</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                value={currentItem?.quantity || 0} 
                                onChange={handleChange} 
                                min="0"
                                className="form-input w-full px-4 py-3" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Low Stock Threshold *</label>
                            <input 
                                type="number" 
                                name="low_stock_threshold" 
                                value={currentItem?.low_stock_threshold || 0} 
                                onChange={handleChange} 
                                min="0"
                                className="form-input w-full px-4 py-3" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Unit Price ($) *</label>
                            <input 
                                type="number" 
                                name="price" 
                                step="0.01" 
                                value={currentItem?.price || 0} 
                                onChange={handleChange} 
                                min="0"
                                className="form-input w-full px-4 py-3" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={handleCloseModal} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            {currentItem?.id ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;