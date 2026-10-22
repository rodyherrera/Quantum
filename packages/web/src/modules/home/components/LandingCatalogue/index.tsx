import { MARQUEE_TEMPLATES } from '@/modules/home/utils/demo/templates';

const HALF = Math.ceil(MARQUEE_TEMPLATES.length / 2);

const ROWS = [MARQUEE_TEMPLATES.slice(0, HALF), MARQUEE_TEMPLATES.slice(HALF)];

interface TrackProps{
    items: typeof MARQUEE_TEMPLATES;
    isCopy?: boolean;
}

const Track = ({ items, isCopy = false }: TrackProps) => (
    <ul aria-hidden={isCopy || undefined} className='lp-marquee__track'>
        {items.map((item) => (
            <li key={item.name} className='flex shrink-0 items-baseline gap-4 pr-[clamp(40px,4.4vw,80px)]'>
                <span className='text-[clamp(1.875rem,3.8vw,3.75rem)] font-light leading-none tracking-[-0.045em]'>{item.name}</span>
                <span className='lp-index hidden sm:inline'>{item.image}</span>
            </li>
        ))}
    </ul>
);

const LandingCatalogue = () => (
    <section aria-labelledby='catalogue' className='lp-rule mt-[clamp(96px,10vw,176px)] pb-[clamp(40px,4vw,64px)] pt-[clamp(32px,3vw,48px)]'>
        <h2 id='catalogue' className='lp-wrap label-caps lp-dim mb-[clamp(28px,3vw,48px)]'>One click away</h2>

        <div className='flex flex-col gap-[clamp(16px,2vw,28px)]'>
            {ROWS.map((row, index) => (
                <div key={index} className={`lp-marquee ${index % 2 === 1 ? 'lp-marquee--reverse' : ''}`}>
                    <Track items={row} />
                    <Track items={row} isCopy />
                </div>
            ))}
        </div>
    </section>
);

export default LandingCatalogue;
