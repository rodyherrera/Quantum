export const setState = (state, action) => {
    const { path, value } = action.payload;
    const keys = Array.isArray(path) ? path : path.split('.');
    let current = state;

    for(let i = 0; i < keys.length - 1; i++){
        const key = keys[i];
        if(!current[key]){
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
};
