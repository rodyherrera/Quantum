export default class ServerRequestBuilder{
    constructor({ setError }){
        this.setError = setError;
    };

    register({ callback, args }){
        return new Promise(async (resolve, reject) => {
            try{
                const response = await callback(...(args || []));
                resolve(response?.data || response);
            }catch(rejection){
                (this.setError) && (this.setError(rejection?.response?.data));
                reject(rejection?.response?.data);
            }
        });
    };
};