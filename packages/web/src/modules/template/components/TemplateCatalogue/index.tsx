import { Input, Label, TextField } from '@heroui/react';
import { Search } from 'lucide-react';
import EmptyState from '@/shared/components/EmptyState';
import IconTile from '@/modules/template/components/IconTile';
import { projectHue } from '@/modules/project/utils/project-hue';
import type { Template } from '@quantum/contracts/modules/template/domain';

interface CatalogueRowProps{
    template: Template;
    isSelected: boolean;
    onSelect: () => void;
}

const CatalogueRow = ({ template, isSelected, onSelect }: CatalogueRowProps) => (
    <button
        type='button'
        onClick={onSelect}
        aria-current={isSelected}
        className='grid w-full grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2.5 rounded-[0.4375rem] px-2 py-1.5 text-left outline-none transition-colors hover:bg-default focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent aria-[current=true]:bg-default aria-[current=true]:shadow-[inset_0_0_0_1px_var(--border)] motion-reduce:transition-none'
    >
        <IconTile hue={projectHue(template.id)}>{template.name.charAt(0).toUpperCase()}</IconTile>
        <span className='min-w-0'>
            <span className='block truncate font-medium text-foreground'>{template.name}</span>
            <span className='block truncate text-xs text-subtle'>{template.description ?? template.slug}</span>
        </span>
    </button>
);

interface TemplateCatalogueProps{
    templates: Template[];
    search: string;
    onSearchChange: (search: string) => void;
    selectedId: number | null;
    onSelect: (template: Template) => void;
}

const TemplateCatalogue = ({ templates, search, onSearchChange, selectedId, onSelect }: TemplateCatalogueProps) => (
    <div className='flex min-h-0 w-full shrink-0 flex-col border-b border-separator lg:w-[20.625rem] lg:border-b-0 lg:border-r'>
        <div className='border-b border-separator p-2.5'>
            <TextField value={search} onChange={onSearchChange} validationBehavior='aria' fullWidth className='relative'>
                <Label className='sr-only'>Search templates</Label>
                <Search aria-hidden='true' className='pointer-events-none absolute left-2.5 top-1/2 z-[1] size-3.5 -translate-y-1/2 text-subtle' />
                <Input placeholder='Search templates' autoComplete='off' className='pl-8' />
            </TextField>
        </div>

        <div className='max-h-80 overflow-y-auto p-1.5 lg:max-h-none lg:min-h-0 lg:flex-1'>
            {templates.length === 0 ? (
                <EmptyState icon={Search} title='No matches' description='Try a different search.' compact />
            ) : (
                <div className='flex flex-col gap-px'>
                    {templates.map((template) => (
                        <CatalogueRow
                            key={template.id}
                            template={template}
                            isSelected={template.id === selectedId}
                            onSelect={() => onSelect(template)}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default TemplateCatalogue;
