import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { useMirroredStyles } from '@/modules/home/hooks/use-mirrored-styles';
import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';

const SHEET_DOCUMENT = '<!doctype html><html><head><style>html,body{height:100%;margin:0;overflow:hidden}</style></head><body class="dark bg-background font-sans text-foreground antialiased"></body></html>';

interface Layout{
    width: number;
    scale: number;
}

interface LandingSheetProps{
    title: string;
    width: number;
    height: number;
    path: string;
    isLive?: boolean;
    children: ReactNode;
}

const LandingSheet = ({ title, width, height, path, isLive = false, children }: LandingSheetProps) => {
    const frame = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<Layout>({ width, scale: 0 });
    const [sheet, setSheet] = useState<Document | null>(null);
    const [root, setRoot] = useState<Root | null>(null);
    useMirroredStyles(sheet);

    useLayoutEffect(() => {
        const node = frame.current;
        if(node === null) return;

        const measure = () => {
            const available = node.clientWidth;
            if(available === 0) return;

            const laid = Math.max(width, available);
            setLayout({ width: laid, scale: available / laid });
        };

        measure();

        const watcher = new ResizeObserver(measure);
        watcher.observe(node);
        return () => watcher.disconnect();
    }, [width]);

    useEffect(() => {
        if(sheet === null) return;

        const host = sheet.createElement('div');
        host.className = 'h-full';
        sheet.body.append(host);

        const created = createRoot(host);
        setRoot(created);

        return () => {
            setRoot(null);
            queueMicrotask(() => {
                created.unmount();
                host.remove();
            });
        };
    }, [sheet]);

    useEffect(() => {
        root?.render(<MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>);
    }, [root, path, children]);

    return (
        <div ref={frame} className='relative w-full overflow-hidden' style={{ aspectRatio: `${width} / ${height}` }}>
            <iframe
                title={title}
                aria-hidden={isLive ? undefined : true}
                tabIndex={isLive ? undefined : -1}
                srcDoc={SHEET_DOCUMENT}
                onLoad={(event) => setSheet(event.currentTarget.contentDocument)}
                className={`absolute left-0 top-0 block origin-top-left border-0 bg-black ${isLive ? '' : 'pointer-events-none'} ${layout.scale === 0 || root === null ? 'invisible' : ''}`}
                style={{ width: layout.width, height: (height * layout.width) / width, transform: `scale(${layout.scale || 1})` }}
            />
        </div>
    );
};

export default LandingSheet;
