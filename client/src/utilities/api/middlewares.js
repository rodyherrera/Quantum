const getResponseStateId = (config) => {
    const id = config?.responseState?.toString() || 'Unknown';
    return id;
}

/**
 * Middleware to measure how long the operation takes.
 * @param {object} config - The operation configuration.
 * @returns {object} Modified configuration with timing information.
 */
export const timingMiddleware = (config) => {
    const startTime = Date.now();
    const id = getResponseStateId(config);
    return {
        ...config,
        api: async (query) => {
            const result = await config.api(query);
            const endTime = Date.now();
            console.log(`${id} - API call took: ${endTime - startTime}ms`);
            return result;
        }
    };
};

/**
 * Middleware to track and log errors.
 * @param {object} config - The operation configuration.
 * @returns {object} Modified configuration to capture errors.
 */
export const errorTrackingMiddleware = (config) => {
    const id = getResponseStateId(config);
    return {
        ...config,
        api: async (query) => {
            try{
                return await config.api(query);
            }catch(error){
                console.error(`${id} - Error caught in middleware:`, error);
                throw error;
            }
        }
    };
};