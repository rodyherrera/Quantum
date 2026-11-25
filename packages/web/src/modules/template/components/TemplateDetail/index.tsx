import { Button, buttonVariants, Chip } from '@heroui/react';
import { ArrowUpRight } from 'lucide-react';
import Panel from '@/modules/template/components/Panel';
import Property from '@/shared/components/detail/Property';
import { TemplateSource } from '@quantum/contracts/modules/template/domain';
import type { InputDef, Template, TemplateServiceSpec } from '@quantum/contracts/modules/template/domain';

const INPUT_TYPE: Record<InputDef['type'], string> = {
    string: 'Text',
    number: 'Number',
    boolean: 'Yes or no',
    secret: 'Secret'
};

const SOURCE_LABEL: Record<TemplateSource, string> = {
    [TemplateSource.Builtin]: 'Built in',
    [TemplateSource.Custom]: 'Custom'
};

const inputHint = (input: InputDef): string => {
    if(input.generate !== undefined) return `${INPUT_TYPE[input.type]}, generated for you`;
    return input.required ? `${INPUT_TYPE[input.type]}, required` : INPUT_TYPE[input.type];
};

interface ServiceRowProps{
    name: string;
    service: TemplateServiceSpec;
}

const ServiceRow = ({ name, service }: ServiceRowProps) => {
    const ports = service.ports ?? [];

    return (
        <div className='grid min-h-10 grid-cols-[minmax(5rem,0.6fr)_minmax(0,1.4fr)_auto] items-center gap-3 px-4 py-1.5'>
            <span className='truncate font-medium text-foreground'>{name}</span>
            <span className='truncate font-mono text-xs text-subtle'>{service.image ?? service.engine ?? '—'}</span>
            <span className='flex flex-wrap justify-end gap-1'>
                {ports.length === 0
                    ? <Chip>Internal only</Chip>
                    : ports.map((port) => <Chip key={`${port.target}/${port.protocol ?? ''}`} className='font-mono'>port {port.target}</Chip>)}
            </span>
        </div>
    );
};

const InputRow = ({ input }: { input: InputDef }) => (
    <div className='grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-1.5'>
        <span className='flex min-w-0 items-baseline gap-2'>
            <span className='truncate text-foreground'>{input.label}</span>
            <code className='truncate font-mono text-xs text-subtle'>{input.key}</code>
        </span>
        <span className='text-xs text-subtle'>{inputHint(input)}</span>
    </div>
);

interface TemplateDetailProps{
    template: Template;
    onInstall: () => void;
}

const TemplateDetail = ({ template, onInstall }: TemplateDetailProps) => {
    const services = Object.entries(template.spec.services ?? {});
    const inputs = template.inputsSchema;

    return (
        <div className='h-full overflow-y-auto'>
            <div className='flex max-w-3xl flex-col gap-5.5 px-5 pb-16 pt-8 sm:px-9'>
                <header className='flex flex-col items-start gap-3'>
                    <h2 className='text-[1.625rem] font-semibold leading-tight tracking-[-0.022em] text-foreground'>{template.name}</h2>
                    <p className='max-w-[58ch] text-sm text-muted'>{template.description ?? 'No description provided.'}</p>

                    <div className='flex flex-wrap gap-2'>
                        <Button size='lg' onPress={onInstall}>Install</Button>

                        {template.website && (
                            <a href={template.website} target='_blank' rel='noreferrer' className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                                Website
                                <ArrowUpRight aria-hidden='true' />
                            </a>
                        )}
                    </div>
                </header>

                {services.length > 0 && (
                    <Panel
                        title='Services'
                        aside={<span className='text-xs text-subtle'>{services.length} {services.length === 1 ? 'service' : 'services'}</span>}
                    >
                        {services.map(([name, service]) => <ServiceRow key={name} name={name} service={service} />)}
                    </Panel>
                )}

                <Panel
                    title='Asks for'
                    aside={(
                        <span className='text-xs text-subtle'>
                            {inputs.length === 0 ? 'Nothing, it runs as is' : `${inputs.length} ${inputs.length === 1 ? 'value' : 'values'}`}
                        </span>
                    )}
                >
                    {inputs.length > 0 ? inputs.map((input) => <InputRow key={input.key} input={input} />) : undefined}
                </Panel>

                <Panel title='Details'>
                    <dl className='px-4 py-1'>
                        <Property label='Identifier'><span className='truncate font-mono text-xs font-normal'>{template.slug}</span></Property>
                        <Property label='Source'>{SOURCE_LABEL[template.source]}</Property>
                    </dl>
                </Panel>
            </div>
        </div>
    );
};

export default TemplateDetail;
