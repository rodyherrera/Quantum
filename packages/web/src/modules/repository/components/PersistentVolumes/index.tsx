import { useState } from 'react';
import { Button, Input, TextField } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import SettingsSection, { SettingsBlock } from '@/shared/components/SettingsSection';
import InlineError from '@/shared/components/InlineError';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { repositoryApi } from '@/modules/repository/api/api';
import { repositoryErrorMessages } from '@/modules/repository/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { Repository } from '@quantum/contracts/modules/repository/domain';

const copy = errorCopy(repositoryErrorMessages);

const cleaned = (paths: string[]): string[] => paths.map((path) => path.trim()).filter((path) => path !== '');

const sameList = (a: string[], b: string[]): boolean => a.length === b.length && a.every((value, index) => value === b[index]);

interface PersistentVolumesProps{
    repository: Repository;
    onSaved: () => void;
}

const PersistentVolumes = ({ repository, onSaved }: PersistentVolumesProps) => {
    const [paths, setPaths] = useState<string[]>(repository.volumes);
    const update = useMutation((volumes: string[]) => repositoryApi.update({ path: { id: repository.id }, body: { volumes } }));

    const dirty = !sameList(cleaned(paths), repository.volumes);

    const save = async () => {
        const saved = await update.run(cleaned(paths)).then(() => true, () => false);
        if(saved) onSaved();
    };

    return (
        <SettingsSection
            title='Persistent volumes'
            description='Paths inside the container whose contents survive deploys and restarts. The checkout at /app already does.'
        >
            {paths.length === 0 && (
                <SettingsBlock>
                    <p className='flex items-center gap-2 text-subtle'>
                        Nothing outside /app is kept between deploys yet.
                    </p>
                </SettingsBlock>
            )}

            {paths.map((path, index) => (
                <div key={index} className='grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-2 px-4 py-2.5'>
                    <TextField
                        aria-label='Container path'
                        value={path}
                        onChange={(value) => setPaths((current) => current.map((entry, position) => (position === index ? value : entry)))}
                        validationBehavior='aria'
                        fullWidth
                    >
                        <Input className='font-mono' placeholder='/var/lib/app/uploads' autoComplete='off' />
                    </TextField>

                    <Button
                        isIconOnly
                        variant='ghost'
                        className='text-subtle hover:text-foreground'
                        aria-label={path === '' ? 'Remove volume' : `Remove ${path}`}
                        onPress={() => setPaths((current) => current.filter((_, position) => position !== index))}
                    >
                        <Trash2 aria-hidden='true' />
                    </Button>
                </div>
            ))}

            {update.error !== undefined && (
                <div className='px-4 py-2.5'>
                    <InlineError>{copy(update.error)}</InlineError>
                </div>
            )}

            <div className='flex flex-wrap items-center justify-between gap-2 px-4 py-2.5'>
                <Button size='sm' variant='ghost' onPress={() => setPaths((current) => (current.includes('') ? current : [...current, '']))}>
                    Add path
                </Button>
                <Button size='sm' isPending={update.loading} isDisabled={!dirty} onPress={() => { void save(); }}>
                    Save and redeploy
                </Button>
            </div>
        </SettingsSection>
    );
};

export default PersistentVolumes;
