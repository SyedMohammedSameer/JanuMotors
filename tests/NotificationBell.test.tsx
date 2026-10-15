import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { buildContext, setContext } from './mockContext';
import { customer, inventoryItem, invoice, jobCard } from './fixtures';
import { DEFAULT_SETTINGS } from '../utils/settings';
import { todayIST } from '../utils/dateIST';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

const Where = () => <div data-testid="where">{useLocation().pathname}</div>;

const renderBell = () =>
    render(
        <MemoryRouter initialEntries={['/']}>
            <NotificationBell />
            <Routes><Route path="*" element={<Where />} /></Routes>
        </MemoryRouter>
    );

const busyState = () => ({
    customers: [customer()],
    inventory: [
        inventoryItem({ id: 'i1', name: 'Air Filter', quantity: 0, low_stock_threshold: 5 }),
        inventoryItem({ id: 'i2', name: 'Engine Oil', quantity: 2, low_stock_threshold: 5 }),
        inventoryItem({ id: 'i3', name: 'Plenty Left', quantity: 50, low_stock_threshold: 5 }),
    ],
    invoices: [
        invoice({ id: 'INV-OVERDUE', due_date: '2020-01-01', payment_status: 'Unpaid' }),
        invoice({ id: 'INV-PAID', due_date: '2020-01-01', payment_status: 'Paid' }),
        invoice({ id: 'INV-FUTURE', due_date: '2999-01-01', payment_status: 'Unpaid' }),
    ],
    jobCards: [
        jobCard({ id: 'J-UNASSIGNED', status: 'Pending', assigned_to: '' }),
        jobCard({ id: 'J-ASSIGNED', status: 'Pending', assigned_to: 'w1' }),
    ],
    carwashBookings: [
        { id: 'cw1', customer_id: 'c1', vehicle_id: 'v1', date: todayIST(), time_slot: '10:30', duration: 45, service_type: 'Basic Wash', status: 'Scheduled', created_at: '' },
    ],
});

describe('NotificationBell', () => {
    it('shows an unread count for every real alert and nothing for items that are fine', async () => {
        setContext(buildContext(busyState()));
        renderBell();
        // out of stock + low stock + 1 overdue invoice + 1 unassigned job + 1 wash today = 5
        const bell = screen.getByRole('button', { name: 'Notifications, 5 unread' });
        await userEvent.click(bell);

        expect(screen.getByText('Out of stock: Air Filter')).toBeInTheDocument();
        expect(screen.getByText('Low stock: Engine Oil')).toBeInTheDocument();
        expect(screen.getByText('Overdue invoice #INV-OVERDUE')).toBeInTheDocument();
        expect(screen.getByText('Unassigned job #J-UNASSIGNED')).toBeInTheDocument();
        expect(screen.getByText('Car wash today at 10:30')).toBeInTheDocument();

        expect(screen.queryByText(/Plenty Left/)).not.toBeInTheDocument();
        expect(screen.queryByText(/INV-PAID/)).not.toBeInTheDocument();
        expect(screen.queryByText(/INV-FUTURE/)).not.toBeInTheDocument();
        expect(screen.queryByText(/J-ASSIGNED/)).not.toBeInTheDocument();
    });

    it('"Mark all as read" clears the badge and the choice is remembered', async () => {
        setContext(buildContext(busyState()));
        const { unmount } = renderBell();
        await userEvent.click(screen.getByRole('button', { name: /Notifications, 5 unread/ }));
        await userEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
        expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();

        unmount();
        renderBell(); // a fresh page load
        expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    });

    it('clicking an alert opens the right page and marks it read', async () => {
        setContext(buildContext(busyState()));
        renderBell();
        await userEvent.click(screen.getByRole('button', { name: /Notifications/ }));
        await userEvent.click(screen.getByText('Overdue invoice #INV-OVERDUE'));
        expect(screen.getByTestId('where')).toHaveTextContent('/invoices/INV-OVERDUE');
        expect(screen.getByRole('button', { name: 'Notifications, 4 unread' })).toBeInTheDocument();
    });

    it('respects the notification switches from Settings', async () => {
        setContext(buildContext({
            ...busyState(),
            settings: { ...DEFAULT_SETTINGS, notifications: { lowStockAlerts: false, invoiceReminders: false, jobAlerts: true, carWashAlerts: false } },
        }));
        renderBell();
        await userEvent.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));
        const panel = screen.getByText('Notifications', { selector: 'h2' }).closest('div')!.parentElement!;
        expect(within(panel).getByText('Unassigned job #J-UNASSIGNED')).toBeInTheDocument();
        expect(within(panel).queryByText(/stock/i)).not.toBeInTheDocument();
        expect(within(panel).queryByText(/Overdue invoice/)).not.toBeInTheDocument();
    });

    it('shows an all-caught-up message when there is nothing to report', async () => {
        setContext(buildContext());
        renderBell();
        await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));
        expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    });
});
