import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { InventoryItem } from '../types';
import Modal from '../components/Modal';
import { PencilSquareIcon, TrashIcon } from '../components/Icons';

const Inventory = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<InventoryItem> | null>(null);

    const getStockIndicator = (item: InventoryItem) => {
        if (item.quantity <= 0) return 'bg-red-500';
        if (item.quantity < item.low_stock_threshold) return 'bg-yellow-400';
        return 'bg-green-500';
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
            // Update existing item
            await dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: currentItem as InventoryItem });
        } else {
            // Add new item
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inventory</h2>
                <button 
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Add New Item
                </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Item Name</th>
                            <th scope="col" className="px-6 py-3">SKU</th>
                            <th scope="col" className="px-6 py-3">Quantity</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Supplier</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.inventory.map(item => (
                            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</td>
                                <td className="px-6 py-4 font-mono">{item.sku}</td>
                                <td className="px-6 py-4 flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${getStockIndicator(item)}`}></span>
                                    {item.quantity}
                                    {item.quantity < item.low_stock_threshold && item.quantity > 0 && <span className="text-yellow-500 ml-2 text-xs">(Low)</span>}
                                    {item.quantity <= 0 && <span className="text-red-500 ml-2 text-xs">(Out)</span>}
                                </td>
                                <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                                <td className="px-6 py-4">{item.supplier}</td>
                                <td className="px-6 py-4 flex items-center space-x-4">
                                    <button onClick={() => handleOpenModal(item)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline flex items-center">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline flex items-center">
                                         <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal title={currentItem?.id ? 'Edit Item' : 'Add New Item'} isOpen={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                            <input type="text" name="name" value={currentItem?.name || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                            <input type="text" name="sku" value={currentItem?.sku || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <input type="number" name="quantity" value={currentItem?.quantity || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
                            <input type="number" name="low_stock_threshold" value={currentItem?.low_stock_threshold || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                            <input type="number" name="price" step="0.01" value={currentItem?.price || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                            <input type="text" name="supplier" value={currentItem?.supplier || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Save Item</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;