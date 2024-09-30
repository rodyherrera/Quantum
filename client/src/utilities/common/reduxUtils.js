export const setState = (state, action) => {
    let { path, value } = action.payload;
    const keys = Array.isArray(path) ? path : path.split('.');
    let current = state;
    for(let i = 0; i < keys.length - 1; i++){
        const key = keys[i];
        if(!current[key]){
            current[key] = {};
        }
        current = current[key];
    }
    if(typeof value === 'function'){
        // ========================================
        // TEMPORAL FIX 
        // @services/repository/operations - repositoryActions
        // ========================================
        const serializedState = JSON.parse(JSON.stringify(state));
        const newValue = value(serializedState);
        current[keys[keys.length - 1]] = newValue;
        return;
    }

    current[keys[keys.length - 1]] = value;
};