const dayMillis = 24 * 60 * 60 * 1000;

export function dateString(isodate: string | number): string {
    const offset = 5.5;
    const date = new Date(isodate);
    date.setTime(date.getTime() + offset * 60 * 60 * 1000);
    return date.toUTCString().slice(0, -4);
}

export function inMillis(isodate: string | number): number {
    return new Date(isodate).getTime();
}

export function dueDateMillis(borrowDate: string, allowedDays: number): number {
    return inMillis(inMillis(borrowDate) + allowedDays * dayMillis);
}

export function remainingDays(borrowDate: string, allowedDays: number): number {
    return Math.round((dueDateMillis(borrowDate, allowedDays) - new Date().getTime()) / dayMillis);
}

export function remainingDaysString(borrowDate: string, allowedDays: number): string {
    const remaining = remainingDays(borrowDate, allowedDays);
    return `${Math.abs(remaining)} days ${remaining < 0 ? 'overdue' : 'remaining'}`;
}

export function outstanding(
    borrowDate: string,
    returnDate: string | null,
    allowedDays: number
): number {
    return !returnDate
        ? Math.abs(remainingDays(borrowDate, allowedDays))
        : Math.round((inMillis(returnDate) - dueDateMillis(borrowDate, allowedDays)) / dayMillis);
}
