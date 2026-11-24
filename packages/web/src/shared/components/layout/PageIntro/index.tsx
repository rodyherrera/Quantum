interface PageIntroProps{
    title: string;
    description?: string;
}

const PageIntro = ({ title, description }: PageIntroProps) => (
    <header className='flex flex-col gap-1.5'>
        <h2 className='text-[1.375rem] font-semibold leading-tight tracking-[-0.018em] text-foreground'>{title}</h2>
        {description !== undefined && <p className='max-w-[60ch] text-muted'>{description}</p>}
    </header>
);

export default PageIntro;
