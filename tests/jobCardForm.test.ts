import { describe, expect, it } from 'vitest';
import { MAX_LABOR_HOURS, addPart, parseLaborHours, parsePartQuantity, removePart } from '../utils/jobCardForm';

describe('parseLaborHours', () => {
    it('parses normal values', () => {
        expect(parseLaborHours('2.5')).toBe(2.5);
        expect(parseLaborHours(3)).toBe(3);
    });

    it('treats empty, negative and non-numeric input as 0', () => {
        expect(parseLaborHours('')).toBe(0);
        expect(parseLaborHours('abc')).toBe(0);
        expect(parseLaborHours('-4')).toBe(0);
        expect(parseLaborHours(NaN)).toBe(0);
        expect(parseLaborHours(Infinity)).toBe(0);
    });

    it('rounds to 2 decimals and respects the NUMERIC(5,2) column limit', () => {
        expect(parseLaborHours('1.239')).toBe(1.24);
        expect(parseLaborHours('5000')).toBe(MAX_LABOR_HOURS);
    });
});

describe('parsePartQuantity', () => {
    it('accepts whole numbers of at least 1', () => {
        expect(parsePartQuantity('3')).toBe(3);
        expect(parsePartQuantity(1)).toBe(1);
    });

    it('floors decimals and rejects unusable input', () => {
        expect(parsePartQuantity('2.9')).toBe(2);
        expect(parsePartQuantity('0')).toBe(0);
        expect(parsePartQuantity('-1')).toBe(0);
        expect(parsePartQuantity('')).toBe(0);
        expect(parsePartQuantity('x')).toBe(0);
    });
});

describe('addPart / removePart', () => {
    it('adds a new part', () => {
        expect(addPart([], 'i1', 2)).toEqual([{ itemId: 'i1', quantity: 2 }]);
    });

    it('merges the same item instead of adding a second row', () => {
        const parts = addPart([{ itemId: 'i1', quantity: 2 }], 'i1', 3);
        expect(parts).toEqual([{ itemId: 'i1', quantity: 5 }]);
    });

    it('keeps different items separate', () => {
        expect(addPart([{ itemId: 'i1', quantity: 1 }], 'i2', 1)).toHaveLength(2);
    });

    it('ignores empty ids and invalid quantities, and never mutates the input', () => {
        const original = [{ itemId: 'i1', quantity: 1 }];
        expect(addPart(original, '', 1)).toBe(original);
        expect(addPart(original, 'i2', 0)).toBe(original);
        expect(addPart(original, 'i2', NaN)).toBe(original);
        addPart(original, 'i1', 5);
        expect(original).toEqual([{ itemId: 'i1', quantity: 1 }]);
    });

    it('removes a part by id', () => {
        const parts = [{ itemId: 'i1', quantity: 1 }, { itemId: 'i2', quantity: 2 }];
        expect(removePart(parts, 'i1')).toEqual([{ itemId: 'i2', quantity: 2 }]);
    });
});
