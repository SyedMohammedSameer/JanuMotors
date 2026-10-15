import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import JobCards from '../pages/JobCards';
import { buildContext, setContext } from './mockContext';
import { customer, inventoryItem, vehicle, worker } from './fixtures';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

const setup = () => {
    const ctx = setContext(buildContext({
        customers: [customer()],
        vehicles: [vehicle()],
        workers: [worker()],
        inventory: [
            inventoryItem({ id: 'i1', name: 'Engine Oil', quantity: 10, price: 2450 }),
            inventoryItem({ id: 'i2', name: 'Oil Filter', quantity: 1, price: 320 }),
        ],
    }));
    render(<MemoryRouter><JobCards /></MemoryRouter>);
    return { ctx, user: userEvent.setup() };
};

const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getAllByRole('button', { name: 'Create Job Card' })[0]);
    return screen.getByRole('dialog', { name: 'Create New Job Card' });
};

const fillBasics = async (user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) => {
    const [customerSelect, vehicleSelect, mechanicSelect] = within(dialog).getAllByRole('combobox');
    await user.selectOptions(customerSelect, 'c1');
    await user.selectOptions(vehicleSelect, 'v1');
    await user.selectOptions(mechanicSelect, 'w1');
    await user.type(within(dialog).getByPlaceholderText(/Describe the work/), 'Oil change and brake check');
};

describe('Create Job Card form', () => {
    it('saves labour hours and the parts that were added', async () => {
        const { ctx, user } = setup();
        const dialog = await openModal(user);
        await fillBasics(user, dialog);

        await user.type(within(dialog).getByLabelText('Labour Hours'), '2.5');

        const partSelect = within(dialog).getByLabelText(/Parts Used/);
        const qty = within(dialog).getByLabelText('Part quantity');
        await user.selectOptions(partSelect, 'i1');
        await user.clear(qty);
        await user.type(qty, '2');
        await user.click(within(dialog).getByRole('button', { name: 'Add' }));
        // adding the same part again merges into one row
        await user.selectOptions(partSelect, 'i1');
        await user.click(within(dialog).getByRole('button', { name: 'Add' }));
        await user.selectOptions(partSelect, 'i2');
        await user.click(within(dialog).getByRole('button', { name: 'Add' }));

        expect(within(dialog).getAllByRole('listitem')).toHaveLength(2);
        await user.click(within(dialog).getByRole('button', { name: 'Create Job Card' }));

        expect(ctx.dispatch).toHaveBeenCalledTimes(1);
        const { type, payload } = (ctx.dispatch as any).mock.calls[0][0];
        expect(type).toBe('ADD_JOB_CARD');
        expect(payload.labor_hours).toBe(2.5);
        expect(payload.parts_used).toEqual([{ itemId: 'i1', quantity: 3 }, { itemId: 'i2', quantity: 1 }]);
        expect(payload.description).toBe('Oil change and brake check');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('includes a part that was selected but whose Add button was not pressed (parts cannot be edited later)', async () => {
        const { ctx, user } = setup();
        const dialog = await openModal(user);
        await fillBasics(user, dialog);
        await user.selectOptions(within(dialog).getByLabelText(/Parts Used/), 'i1');
        expect(within(dialog).getByText(/Not added yet/)).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Create Job Card' }));
        expect((ctx.dispatch as any).mock.calls[0][0].payload.parts_used).toEqual([{ itemId: 'i1', quantity: 1 }]);
    });

    it('defaults to no parts and 0 hours when nothing was entered', async () => {
        const { ctx, user } = setup();
        const dialog = await openModal(user);
        await fillBasics(user, dialog);
        await user.click(within(dialog).getByRole('button', { name: 'Create Job Card' }));
        const { payload } = (ctx.dispatch as any).mock.calls[0][0];
        expect(payload.parts_used).toEqual([]);
        expect(payload.labor_hours).toBe(0);
    });

    it('warns when more of a part is requested than is in stock', async () => {
        const { user } = setup();
        const dialog = await openModal(user);
        await user.selectOptions(within(dialog).getByLabelText(/Parts Used/), 'i2'); // only 1 in stock
        const qty = within(dialog).getByLabelText('Part quantity');
        await user.clear(qty);
        await user.type(qty, '4');
        await user.click(within(dialog).getByRole('button', { name: 'Add' }));
        expect(within(dialog).getByText('Only 1 in stock')).toBeInTheDocument();
    });

    it('is empty again after Cancel (no leftover values from the previous attempt)', async () => {
        const { user } = setup();
        let dialog = await openModal(user);
        await fillBasics(user, dialog);
        await user.type(within(dialog).getByLabelText('Labour Hours'), '3');
        await user.selectOptions(within(dialog).getByLabelText(/Parts Used/), 'i1');
        await user.click(within(dialog).getByRole('button', { name: 'Add' }));
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        dialog = await openModal(user);
        const [customerSelect, vehicleSelect, mechanicSelect] = within(dialog).getAllByRole('combobox');
        expect(customerSelect).toHaveValue('');
        expect(vehicleSelect).toHaveValue('');
        expect(mechanicSelect).toHaveValue('');
        expect(within(dialog).getByPlaceholderText(/Describe the work/)).toHaveValue('');
        expect(within(dialog).getByLabelText('Labour Hours')).toHaveValue(null);
        expect(within(dialog).queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('is also reset when closed with Escape', async () => {
        const { user } = setup();
        let dialog = await openModal(user);
        await user.type(within(dialog).getByPlaceholderText(/Describe the work/), 'half written');
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        dialog = await openModal(user);
        expect(within(dialog).getByPlaceholderText(/Describe the work/)).toHaveValue('');
    });
});
