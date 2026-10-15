import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobCardDetail from '../pages/JobCardDetail';
import { buildContext, setContext } from './mockContext';
import { customer, jobCard, vehicle, worker } from './fixtures';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

const page = () => (
    <MemoryRouter initialEntries={['/job-cards/J1']}>
        <Routes><Route path="/job-cards/:jobCardId" element={<JobCardDetail />} /></Routes>
    </MemoryRouter>
);

const ctxFor = (job: Record<string, unknown>, cust: Record<string, unknown>) =>
    setContext(buildContext({ jobCards: [jobCard(job)], customers: [customer(cust)], vehicles: [vehicle()], workers: [worker()] }));

describe('Job card: completing a job logs service history once', () => {
    it('logs one entry linked to the job when it is completed', async () => {
        const ctx = ctxFor({ status: 'In Progress' }, { service_history: [] });
        render(page());
        await userEvent.selectOptions(screen.getByLabelText('Update Status'), 'Completed');

        const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
        const customerUpdates = calls.filter((a: any) => a.type === 'UPDATE_CUSTOMER');
        expect(customerUpdates).toHaveLength(1);
        expect(customerUpdates[0].payload.service_history).toHaveLength(1);
        expect(customerUpdates[0].payload.service_history[0]).toMatchObject({ job_card_id: 'J1', description: 'Full service', cost: 0 });
        expect(calls.find((a: any) => a.type === 'UPDATE_JOB_CARD').payload.status).toBe('Completed');
    });

    it('does NOT add a second entry when the same job is completed again (Completed -> In Progress -> Completed)', async () => {
        const existing = { id: 'SH1', date: '2026-10-01T00:00:00.000Z', description: 'Full service', cost: 0, job_card_id: 'J1' };
        const ctx = ctxFor({ status: 'In Progress' }, { service_history: [existing] });
        render(page());
        await userEvent.selectOptions(screen.getByLabelText('Update Status'), 'Completed');

        const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
        expect(calls.some((a: any) => a.type === 'UPDATE_CUSTOMER')).toBe(false);
        // the job itself is still marked completed
        expect(calls.find((a: any) => a.type === 'UPDATE_JOB_CARD').payload.status).toBe('Completed');
    });

    it('still logs a different job for the same customer', async () => {
        const otherJob = { id: 'SH0', date: '2026-09-01T00:00:00.000Z', description: 'Full service', cost: 0, job_card_id: 'J-OTHER' };
        const ctx = ctxFor({ status: 'Pending' }, { service_history: [otherJob] });
        render(page());
        await userEvent.selectOptions(screen.getByLabelText('Update Status'), 'Completed');
        const update = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]).find((a: any) => a.type === 'UPDATE_CUSTOMER');
        expect(update.payload.service_history).toHaveLength(2);
        expect(update.payload.service_history[0].job_card_id).toBe('J1');
    });

    it('does not log history for statuses other than Completed', async () => {
        const ctx = ctxFor({ status: 'Pending' }, { service_history: [] });
        render(page());
        await userEvent.selectOptions(screen.getByLabelText('Update Status'), 'In Progress');
        expect((ctx.dispatch as any).mock.calls.some((c: any[]) => c[0].type === 'UPDATE_CUSTOMER')).toBe(false);
    });
});
