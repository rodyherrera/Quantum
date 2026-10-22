import { Input, Label, TextField } from '@heroui/react';
import { Search } from 'lucide-react';
import EmptyState from '@/shared/components/EmptyState';
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
        className={`flex w-full items-center justify-between gap-4 border-b border-separator py-3 text-left transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none ${
            isSelected ? 'text-foreground' : 'text-muted hover:text-foreground'
        }`}
    >
        <span className='truncate text-sm'>{template.name}</span>
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
    <div className='flex min-h-0 w-full shrink-0 flex-col gap-4 border-b border-border pb-6 pl-5 pr-5 pt-8 lg:h-full lg:w-[24rem] lg:border-b-0 lg:border-r lg:pt-9'>
        <p className='label-caps text-muted'>
            Catalogue · {templates.length} {templates.length === 1 ? 'template' : 'templates'}
        </p>

        <TextField value={search} onChange={onSearchChange} validationBehavior='aria' fullWidth>
            <Label className='sr-only'>Search templates</Label>
            <Input placeholder='Search templates…' autoComplete='off' />
        </TextField>

        <div className='min-h-0 flex-1 overflow-y-auto'>
            {templates.length === 0 ? (
                <EmptyState icon={Search} title='No matches' description='Try a different search.' compact />
            ) : (
                <div className='flex flex-col'>
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
