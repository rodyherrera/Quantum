export default class ServerRequestBuilder{
    constructor({ setError }){
        this.setError = setError;
    };

    handleError = (rejection) => {
        if(this.setError){
            this.setError(rejection?.response?.data);
        }
        return rejection?.response?.data;
    };

    register({ callback, args }){
        return new Promise(async (resolve, reject) => {
            try{
                const response = await callback(...(args || []));
                resolve(response?.data || response);
            }catch(rejection){
                reject(this.handleError(rejection));
            }
        });
    };
};