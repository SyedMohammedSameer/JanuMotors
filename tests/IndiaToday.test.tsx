import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CarWashScheduling from '../pages/CarWashScheduling';
import Workers from '../pages/Workers';
import { buildContext, setContext } from './mockContext';
import { worker } from './fixtures';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

// 19:00 UTC on 14 Oct is 00:30 IST on 15 Oct: the UTC date is still "yesterday" for a garage in India.
const JUST_AFTER_MIDNIGHT_IST = new Date('2026-10-14T19:00:00Z');
const EVENING_IST = new Date('2026-10-14T16:00:00Z'); // 21:30 IST on 14 Oct

const freezeClock = (at: Date) => vi.useFakeTimers({ toFake: ['Date'], now: at });

afterEach(() => vi.useRealTimers());

describe('Car Wash "today" uses India time', () => {
    const renderPage = () => {
        setContext(buildContext());
        render(<MemoryRouter><CarWashScheduling /></MemoryRouter>);
    };

    it('shows the 15th (not the 14th) at 00:30 IST and labels it Today', () => {
        freezeClock(JUST_AFTER_MIDNIGHT_IST);
        renderPage();
        expect(screen.getByLabelText('Select date')).toHaveValue('2026-10-15');
        expect(screen.getByText(/^Today •/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Thursday, October 15, 2026' })).toBeInTheDocument();
    });

    it('still shows the 14th in the evening IST', () => {
        freezeClock(EVENING_IST);
        renderPage();
        expect(screen.getByLabelText('Select date')).toHaveValue('2026-10-14');
        expect(screen.getByText(/^Today •/)).toBeInTheDocument();
    });

    it('labels earlier days Past and later days Future relative to the IST date', async () => {
        freezeClock(JUST_AFTER_MIDNIGHT_IST);
        renderPage();
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Previous day' }));
        expect(screen.getByLabelText('Select date')).toHaveValue('2026-10-14');
        expect(screen.getByText(/^Past Date •/)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Next day' }));
        await user.click(screen.getByRole('button', { name: 'Next day' }));
        expect(screen.getByLabelText('Select date')).toHaveValue('2026-10-16');
        expect(screen.getByText(/^Future Date •/)).toBeInTheDocument();
    });
});

describe('Workers attendance uses India time', () => {
    it('records a clock-in made at 00:30 IST against the 15th', async () => {
        freezeClock(JUST_AFTER_MIDNIGHT_IST);
        const ctx = setContext(buildContext({ workers: [worker()], attendance: [] }));
        render(<MemoryRouter><Workers /></MemoryRouter>);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /Clock In \(1\)/ }));
        const dialog = screen.getByRole('dialog', { name: 'Clock In Worker' });
        await user.selectOptions(within(dialog).getByRole('combobox'), 'w1');
        await user.click(within(dialog).getByRole('button', { name: 'Confirm Clock In' }));

        const action = (ctx.dispatch as any).mock.calls[0][0];
        expect(action.type).toBe('ADD_ATTENDANCE');
        expect(action.payload.date).toBe('2026-10-15');
        expect(action.payload.worker_id).toBe('w1');
    });

    it('lists a record dated today (IST) as today\'s attendance', () => {
        freezeClock(JUST_AFTER_MIDNIGHT_IST);
        setContext(buildContext({
            workers: [worker()],
            attendance: [{ id: 'a1', worker_id: 'w1', date: '2026-10-15', clock_in: '2026-10-14T18:45:00.000Z' }],
        }));
        render(<MemoryRouter><Workers /></MemoryRouter>);
        // the worker is already clocked in, so there is nobody left to clock in and one person to clock out
        expect(screen.getByRole('button', { name: /Clock In \(0\)/ })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Clock Out \(1\)/ })).toBeEnabled();
    });
});
