/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

/**
 * Takes a date object or timestamp and returns a human-readable representation
 * of the time elapsed since that date.
 *
*/
export const formatDate = (date, useLocale) => {
    if(useLocale){
        return new Date(date).toLocaleString(navigator.language.split('-')[0], {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];
    const secondsElapsed = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    for(const { label, seconds } of intervals){
        const intervalValue = Math.floor(secondsElapsed / seconds);
        if(intervalValue > 0){
            return `${intervalValue} ${label}${intervalValue > 1 ? 's' : ''} ago`; 
        }
    }
    // In case the date is very recent.
    return 'Just now';
};

export const humanFileSize = (size) => {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}