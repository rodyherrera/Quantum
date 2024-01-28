export default class ServerRequestBuilder{
    handleRejection(error){
        if(error?.response?.data?.message){
            return error.response.data.message;
        }
        return error.message;
    };

    register({ callback, args }){
        return new Promise(async (resolve, reject) => {
            try{
                const response = await callback(...(args || []));
                resolve(response?.data || response);
            }catch(rejection){
                const error = this.handleRejection(rejection);
                reject(error);
            }
        });
    };
};