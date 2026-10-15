// The garage runs on India Standard Time. Deriving "today" from `toISOString()` gives the UTC date, which is
// still *yesterday* between 00:00 and 05:30 IST, so every "today" in the app goes through these helpers instead.

export const IST_TIME_ZONE = 'Asia/Kolkata';

const istDateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/** The calendar date (YYYY-MM-DD) of `date` as seen in India Standard Time. */
export const toISTDateString = (date: Date = new Date()): string => {
    const parts = istDateParts.formatToParts(date);
    const pick = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${pick('year')}-${pick('month')}-${pick('day')}`;
};

/** Today's date (YYYY-MM-DD) in India Standard Time. */
export const todayIST = (): string => toISTDateString(new Date());

/** Adds (or subtracts) whole days to a YYYY-MM-DD string. Pure calendar arithmetic, so no timezone or DST is involved. */
export const addDaysToDateString = (dateStr: string, days: number): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};
