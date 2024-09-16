export interface Container{
    stop(): Promise<void>;
    remove(options: { force: boolean }): Promise<void>;
    inspect(): Promise<any>;
    start(): Promise<void>;
}