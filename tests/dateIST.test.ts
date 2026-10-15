import { describe, expect, it } from 'vitest';
import { addDaysToDateString, toISTDateString } from '../utils/dateIST';

describe('toISTDateString', () => {
    it('is still the previous day one second before midnight IST', () => {
        expect(toISTDateString(new Date('2026-10-14T18:29:59Z'))).toBe('2026-10-14');
    });

    it('rolls over to the next day exactly at midnight IST (18:30 UTC)', () => {
        expect(toISTDateString(new Date('2026-10-14T18:30:00Z'))).toBe('2026-10-15');
    });

    it('differs from the UTC date between 00:00 and 05:30 IST (the bug this helper fixes)', () => {
        const instant = new Date('2026-10-14T20:00:00Z'); // 01:30 IST on the 15th
        expect(instant.toISOString().split('T')[0]).toBe('2026-10-14');
        expect(toISTDateString(instant)).toBe('2026-10-15');
    });

    it('handles the year boundary', () => {
        expect(toISTDateString(new Date('2026-12-31T20:00:00Z'))).toBe('2027-01-01');
    });

    it('zero-pads month and day', () => {
        expect(toISTDateString(new Date('2026-03-04T06:00:00Z'))).toBe('2026-03-04');
    });
});

describe('addDaysToDateString', () => {
    it('adds days within a month', () => {
        expect(addDaysToDateString('2026-10-15', 15)).toBe('2026-10-30');
    });

    it('crosses month and year boundaries', () => {
        expect(addDaysToDateString('2026-10-31', 1)).toBe('2026-11-01');
        expect(addDaysToDateString('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDaysToDateString('2026-10-20', 15)).toBe('2026-11-04');
    });

    it('handles leap days', () => {
        expect(addDaysToDateString('2028-02-28', 1)).toBe('2028-02-29');
        expect(addDaysToDateString('2026-02-28', 1)).toBe('2026-03-01');
    });

    it('subtracts days', () => {
        expect(addDaysToDateString('2026-03-01', -1)).toBe('2026-02-28');
        expect(addDaysToDateString('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('returns the same date for zero days', () => {
        expect(addDaysToDateString('2026-10-15', 0)).toBe('2026-10-15');
    });
});
