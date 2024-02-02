export const formatDate = (date) => {
    const currentDate = new Date();
    const timestamp = new Date(date);
    const seconds = Math.floor((currentDate - timestamp) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if(interval > 1)
        return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if(interval > 1)
        return `${interval} months ago`;
    interval = Math.floor(seconds / 604800);
    if(interval > 1)
        return `${interval} weeks ago`;
    interval = Math.floor(seconds / 86400);
    if(interval > 1)
      return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if(interval > 1)
        return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if(interval > 1)
         return `${interval} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
};