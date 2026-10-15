import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CustomerDetail from '../pages/CustomerDetail';
import { buildContext, setContext } from './mockContext';
import { customer, vehicle } from './fixtures';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

const setup = (cust: Record<string, unknown> = {}) => {
    const ctx = setContext(buildContext({ customers: [customer(cust)], vehicles: [vehicle()] }));
    render(
        <MemoryRouter initialEntries={['/customers/c1']}>
            <Routes><Route path="/customers/:customerId" element={<CustomerDetail />} /></Routes>
        </MemoryRouter>
    );
    return { ctx, user: userEvent.setup() };
};

const openEdit = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /Edit Details/ }));
    return screen.getByRole('dialog', { name: 'Edit Customer Details' });
};

const savedCustomer = (ctx: ReturnType<typeof buildContext>) =>
    (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]).find((a: any) => a.type === 'UPDATE_CUSTOMER').payload;

describe('Edit Customer', () => {
    it('can clear the email and the address', async () => {
        const { ctx, user } = setup({ email: 'rahul@example.com', address: '12 MG Road, Kadapa' });
        const dialog = await openEdit(user);
        await user.clear(within(dialog).getByDisplayValue('rahul@example.com'));
        await user.clear(within(dialog).getByDisplayValue('12 MG Road, Kadapa'));
        await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

        const saved = savedCustomer(ctx);
        expect(saved.email).toBe('');
        expect(saved.address).toBe('');
        expect(saved.name).toBe('Rahul Sharma');
        expect(saved.phone).toBe('+91 9848000000');
    });

    it('keeps the existing values when nothing was changed', async () => {
        const { ctx, user } = setup({ email: 'rahul@example.com', address: '12 MG Road, Kadapa' });
        const dialog = await openEdit(user);
        await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));
        const saved = savedCustomer(ctx);
        expect(saved.email).toBe('rahul@example.com');
        expect(saved.address).toBe('12 MG Road, Kadapa');
    });

    it('still saves edits to other fields', async () => {
        const { ctx, user } = setup();
        const dialog = await openEdit(user);
        const name = within(dialog).getByDisplayValue('Rahul Sharma');
        await user.clear(name);
        await user.type(name, 'Rahul S. Sharma');
        await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));
        expect(savedCustomer(ctx).name).toBe('Rahul S. Sharma');
    });

    it('works for a customer that had no email or address saved at all', async () => {
        const { ctx, user } = setup({ email: null, address: null });
        const dialog = await openEdit(user);
        await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));
        const saved = savedCustomer(ctx);
        expect(saved.email == null || saved.email === '').toBe(true);
    });
});
