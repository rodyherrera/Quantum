/* The path a release must answer on before it takes traffic. Blank means the port answering is enough. */
export const normalizeHealthCheckPath = (raw: string): string | null => {
    const path = raw.trim();
    if(path === '') return null;
    return path.startsWith('/') ? path : `/${path}`;
};
