/**
 * Converts a file size in bytes to a human-readable format.
 *
 * @param {number} size - The size in bytes.
 * @returns {string} - A human-readable file size string.
*/
export const humanFileSize = (size) => {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}