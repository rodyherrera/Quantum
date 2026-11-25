import { Input, Label, TextField } from '@heroui/react';
import { Search } from 'lucide-react';
import Toolbar from '@/shared/components/layout/Toolbar';
import EntitySelect from '@/shared/components/EntitySelect';
import type { Project } from '@quantum/contracts/modules/project/domain';

interface ApplicationsFiltersProps{
    projects: Pick<Project, 'id' | 'name'>[];
    projectId: number | null;
    search: string;
    shown: number;
    total: number;
    onProjectChange: (projectId: number) => void;
    onSearchChange: (search: string) => void;
}

const ApplicationsFilters = ({ projects, projectId, search, shown, total, onProjectChange, onSearchChange }: ApplicationsFiltersProps) => (
    <Toolbar>
        <div className='w-48'>
            <EntitySelect
                items={projects}
                getKey={(project) => project.id}
                getLabel={(project) => project.name}
                value={projectId}
                onChange={(key) => onProjectChange(Number(key))}
                placeholder='Select a project'
                ariaLabel='Project'
            />
        </div>

        <TextField value={search} onChange={onSearchChange} validationBehavior='aria' className='relative w-56'>
            <Label className='sr-only'>Search</Label>
            <Search aria-hidden='true' className='pointer-events-none absolute left-2.5 top-1/2 z-[1] size-3.5 -translate-y-1/2 text-subtle' />
            <Input placeholder='Search by name' autoComplete='off' className='pl-8' />
        </TextField>

        <span className='ml-auto text-xs tabular-nums text-subtle'>{shown === total ? `${total} applications` : `${shown} of ${total}`}</span>
    </Toolbar>
);

export default ApplicationsFilters;
