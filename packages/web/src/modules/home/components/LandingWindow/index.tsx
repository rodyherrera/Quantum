import type { ReactNode } from 'react';

interface LandingWindowProps{
    title: string;
    className?: string;
    children: ReactNode;
}

const LandingWindow = ({ title, className = '', children }: LandingWindowProps) => (
    <div className={`lp-corners ${className}`}>
        <div className='lp-window'>
            <div className='lp-window__bar'>
                <span aria-hidden='true' className='lp-window__controls'>
                    <span />
                    <span />
                    <span />
                </span>

                <span className='label-caps lp-faint truncate'>{title}</span>
            </div>

            {children}
        </div>
    </div>
);

export default LandingWindow;
