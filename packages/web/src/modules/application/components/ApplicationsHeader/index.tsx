import { Button } from '@heroui/react';
import { ArrowRight, Database as DatabaseIcon, FileCode2 } from 'lucide-react';
import PageHeader from '@/shared/components/layout/PageHeader';

interface ApplicationsHeaderProps{
    canAddDatabase: boolean;
    onAddApplication: () => void;
    onAddCompose: () => void;
    onAddDatabase: () => void;
}

const ApplicationsHeader = ({ canAddDatabase, onAddApplication, onAddCompose, onAddDatabase }: ApplicationsHeaderProps) => (
    <PageHeader
        title='Applications'
        actions={(
            <div className='flex flex-wrap gap-2'>
                <Button variant='secondary' isDisabled={!canAddDatabase} onPress={onAddDatabase}>
                    <DatabaseIcon aria-hidden='true' className='size-4' />
                    New database
                </Button>
                <Button variant='secondary' onPress={onAddCompose}>
                    <FileCode2 aria-hidden='true' className='size-4' />
                    Deploy stack
                </Button>
                <Button onPress={onAddApplication}>
                    New application
                    <ArrowRight aria-hidden='true' className='size-4' />
                </Button>
            </div>
        )}
    />
);

export default ApplicationsHeader;
