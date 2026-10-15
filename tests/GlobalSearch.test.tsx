import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';
import { buildContext, setContext } from './mockContext';
import { customer, inventoryItem, invoice, jobCard, vehicle, worker } from './fixtures';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

const Where = () => <div data-testid="where">{useLocation().pathname}</div>;

const setup = () => {
    setContext(buildContext({
        customers: [customer(), customer({ id: 'c2', name: 'Priya Nair', phone: '+91 9000000001', email: 'priya@example.com' })],
        vehicles: [vehicle()],
        jobCards: [jobCard({ description: 'Brake pads replacement' })],
        invoices: [invoice()],
        inventory: [inventoryItem({ name: 'Brake Pad Set', sku: 'BRK-1' })],
        workers: [worker({ name: 'Suresh' })],
    }));
    render(
        <MemoryRouter initialEntries={['/']}>
            <GlobalSearch />
            <Routes><Route path="*" element={<Where />} /></Routes>
        </MemoryRouter>
    );
    return userEvent.setup();
};

describe('GlobalSearch (Quick search)', () => {
    it('finds customers by name, phone or email', async () => {
        const user = setup();
        const box = screen.getByRole('combobox', { name: 'Quick search' });
        await user.type(box, 'priya');
        expect(screen.getByRole('option', { name: /Priya Nair/ })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Rahul/ })).not.toBeInTheDocument();

        await user.clear(box);
        await user.type(box, '9848');
        expect(screen.getByRole('option', { name: /Rahul Sharma/ })).toBeInTheDocument();
    });

    it('groups results across customers, vehicles, jobs, invoices, inventory', async () => {
        const user = setup();
        await user.type(screen.getByRole('combobox'), 'brake');
        expect(screen.getByRole('option', { name: /#J1/ })).toBeInTheDocument();      // job description
        expect(screen.getByRole('option', { name: /Brake Pad Set/ })).toBeInTheDocument(); // inventory
        await user.clear(screen.getByRole('combobox'));
        await user.type(screen.getByRole('combobox'), 'AP 04');
        expect(screen.getByRole('option', { name: /AP 04 AB 1234/ })).toBeInTheDocument(); // vehicle plate
    });

    it('Enter opens the highlighted result and clears the box', async () => {
        const user = setup();
        const box = screen.getByRole('combobox');
        await user.type(box, 'rahul');
        await user.keyboard('{Enter}');
        expect(screen.getByTestId('where')).toHaveTextContent('/customers/c1');
        expect(box).toHaveValue('');
    });

    it('arrow keys move the highlight', async () => {
        const user = setup();
        await user.type(screen.getByRole('combobox'), 'a'); // matches several customers/items
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(1);
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        await user.keyboard('{ArrowDown}');
        expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('says so when nothing matches, and Escape closes the list', async () => {
        const user = setup();
        const box = screen.getByRole('combobox');
        await user.type(box, 'zzzzzz');
        expect(screen.getByText(/No results for/)).toBeInTheDocument();
        await user.keyboard('{Escape}');
        expect(screen.queryByText(/No results for/)).not.toBeInTheDocument();
    });
});
