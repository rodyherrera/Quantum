import { TERMINAL_THEME } from '@/shared/components/terminal/theme';
import { DEMO_LOGS } from '@/modules/home/utils/demo/terminal';

const OperateLogs = () => (
    <pre
        className='m-0 w-full overflow-hidden rounded-md border border-separator bg-terminal px-2.5 py-2 font-mono text-[0.6875rem] leading-[1.65]'
        style={{ color: TERMINAL_THEME.foreground }}
    >
        {DEMO_LOGS.map((line) => <span key={line} className='block overflow-hidden text-ellipsis whitespace-pre'>{line}</span>)}
    </pre>
);

export default OperateLogs;
