// Pure helpers behind the "Create Job Card" form (parts picker + labour hours), kept separate so they can be unit-tested.

export interface PartLine {
    itemId: string;
    quantity: number;
}

// job_cards.labor_hours is NUMERIC(5, 2)
export const MAX_LABOR_HOURS = 999.99;

/** Turns the raw labour-hours input into a safe number: finite, never negative, 2 decimals, within the column limit. */
export const parseLaborHours = (raw: string | number): number => {
    const value = typeof raw === 'number' ? raw : parseFloat(raw);
    if (!Number.isFinite(value) || value <= 0) return 0;
    return Math.min(Math.round(value * 100) / 100, MAX_LABOR_HOURS);
};

/** Whole-number quantity of at least 1, or 0 when the input is not usable. */
export const parsePartQuantity = (raw: string | number): number => {
    const value = Math.floor(Number(raw));
    return Number.isFinite(value) && value >= 1 ? value : 0;
};

/** Adds a part to the list; adding the same item again increases its quantity instead of creating a second row. */
export const addPart = (parts: PartLine[], itemId: string, quantity: number): PartLine[] => {
    const qty = Math.floor(quantity);
    if (!itemId || !Number.isFinite(qty) || qty < 1) return parts;
    const existing = parts.find(p => p.itemId === itemId);
    if (existing) {
        return parts.map(p => (p.itemId === itemId ? { ...p, quantity: p.quantity + qty } : p));
    }
    return [...parts, { itemId, quantity: qty }];
};

export const removePart = (parts: PartLine[], itemId: string): PartLine[] =>
    parts.filter(p => p.itemId !== itemId);
