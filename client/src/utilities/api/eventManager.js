class EventManager{
    constructor(){
        this.events = {};
    }

    on(event, callback){
        this.events[event] = callback;
    }

    emit(event, ...args){
        if(this.events[event]){
            this.events[event](...args);
        }
    }
}

export default EventManager;