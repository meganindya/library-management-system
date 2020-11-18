/** stores the number of milliseconds in a day */
const dayMillis = 24 * 60 * 60 * 1000;

/**
 * Returns a string representation of the UTC date in IST
 * @param isodate - ISODateString or UTC time in milliseconds
 */
export function dateString(isodate: string | number): string {
    const offset = 5.5;
    const date = new Date(isodate);
    date.setTime(date.getTime() + offset * 60 * 60 * 1000);
    return date.toUTCString().slice(0, -4);
}

/**
 * Returns date in milliseconds
 * @param isodate - ISODateString
 */
export function inMillis(isodate: string | number): number {
    return new Date(isodate).getTime();
}

/**
 * Returns due date in milliseconds
 * @param borrowDate - ISODateString of borrow date
 * @param allowedDays - days until deadline
 */
export function dueDateMillis(borrowDate: string, allowedDays: number): number {
    return inMillis(borrowDate) + allowedDays * dayMillis;
}

/**
 * Returns the number of full days remaining before deadline
 * @param borrowDate - ISODateString of borrow date
 * @param allowedDays - days until deadline
 */
export function remainingDays(borrowDate: string, allowedDays: number): number {
    return Math.round((dueDateMillis(borrowDate, allowedDays) - Date.now()) / dayMillis);
}

/**
 * String describing days remaining or overdue
 * @param borrowDate - ISODateString of borrow date
 * @param allowedDays - days until deadline
 */
export function remainingDaysString(borrowDate: string, allowedDays: number): string {
    const remaining = remainingDays(borrowDate, allowedDays);
    return `${Math.abs(remaining)} days ${remaining < 0 ? 'overdue' : 'remaining'}`;
}

/**
 * Returns outstanding amount for a transaction
 * @param borrowDate - ISODateString of borrow date
 * @param returnDate - ISODateString of return date
 * @param allowedDays - days until deadline
 */
export function outstanding(
    borrowDate: string,
    returnDate: string | null,
    allowedDays: number
): number {
    return !returnDate
        ? Math.abs(remainingDays(borrowDate, allowedDays))
        : Math.round((inMillis(returnDate) - dueDateMillis(borrowDate, allowedDays)) / dayMillis);
}
