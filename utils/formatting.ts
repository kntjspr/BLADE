/**
 * Format a timestamp to a localized date string
 */
export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

/**
 * Truncate a hash or long string with ellipsis
 */
export function truncateHash(hash: string, length: number = 16): string {
    return hash.length > length ? `${hash.substring(0, length)}...` : hash;
}
