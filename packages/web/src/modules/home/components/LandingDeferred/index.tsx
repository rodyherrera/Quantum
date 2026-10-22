import { Suspense, useRef } from 'react';
import { useInView } from '@/modules/home/hooks/use-in-view';
import type { ReactNode } from 'react';

interface LandingDeferredProps{
    className?: string;
    children: ReactNode;
}

const LandingDeferred = ({ className = '', children }: LandingDeferredProps) => {
    const frame = useRef<HTMLDivElement>(null);
    const isNear = useInView(frame, { margin: '100% 0px', once: true });

    return (
        <div ref={frame} className={className}>
            {isNear ? <Suspense fallback={null}>{children}</Suspense> : null}
        </div>
    );
};

export default LandingDeferred;
