export const formatDate = (date) => {
    const dateNow = new Date();
    const dateThen = new Date(date);
    const difference = dateNow - dateThen;
    const hours = Math.floor(difference / 1000 / 60 / 60);
    const days = Math.floor(hours / 24);
    if(hours < 24){
        if(hours === 1)
            return `${hours} hour ago`;
        else if(hours === 0)
            return 'just now';
        return `${hours} hours ago`;
    }
    return `${days} days ago`;
};