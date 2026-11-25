import { useState } from 'react';
import { Button } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import typia from 'typia';
import SettingsSection from '@/shared/components/SettingsSection';
import SettingsRow from '@/shared/components/SettingsRow';
import Modal from '@/shared/components/Modal';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import InlineError from '@/shared/components/InlineError';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useResource } from '@/shared/hooks/api/use-resource';
import { registryCredentialApi } from '@/modules/registry/api/api';
import { registryCredentialRoutes } from '@quantum/contracts/modules/registry/routes';
import { registryErrorMessages } from '@/modules/registry/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { CreateRegistryCredentialInput } from '@quantum/contracts/modules/registry/http';
import type { RegistryCredential } from '@quantum/contracts/modules/registry/domain';

const copy = errorCopy(registryErrorMessages);

const INITIAL_VALUES: CreateRegistryCredentialInput = { registry: 'ghcr.io', username: '', secret: '' };

const complete = (values: CreateRegistryCredentialInput): boolean =>
    values.registry.trim() !== '' && values.username.trim() !== '' && values.secret !== '';

interface AddRegistryDialogProps{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (input: CreateRegistryCredentialInput) => Promise<unknown>;
}

const AddRegistryDialog = ({ isOpen, onClose, onAdd }: AddRegistryDialogProps) => {
    const form = useForm<CreateRegistryCredentialInput>({
        validate: typia.createValidate<CreateRegistryCredentialInput>(),
        submitErrorMessages: registryErrorMessages,
        initialValues: INITIAL_VALUES,
        onSubmit: async (values) => {
            await onAdd({ registry: values.registry.trim(), username: values.username.trim(), secret: values.secret });
            form.reset();
            onClose();
        }
    });

    const cancel = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => { if(!open) cancel(); }} title='Add registry'>
            <Form form={form} className='flex flex-col gap-3.5'>
                <Field form={form} name='registry' label='Registry host' placeholder='ghcr.io' autoComplete='off' />

                <div className='grid gap-3.5 sm:grid-cols-2'>
                    <Field form={form} name='username' label='Username' placeholder='octocat' autoComplete='off' />
                    <Field form={form} name='secret' label='Token or password' type='password' autoComplete='off' />
                </div>

                <p className='text-xs text-subtle'>
                    For GitHub Container Registry, use your GitHub username and a classic personal access token with
                    the <span className='font-mono'>read:packages</span> scope.
                </p>

                <div className='flex justify-end gap-2'>
                    <Button variant='secondary' isDisabled={form.submitting} onPress={cancel}>Cancel</Button>
                    <Button type='submit' isPending={form.submitting} isDisabled={!complete(form.values)}>Add registry</Button>
                </div>
            </Form>
        </Modal>
    );
};

interface RegistrySectionProps{
    organizationId: number;
}

const RegistrySection = ({ organizationId }: RegistrySectionProps) => {
    const credentials = useResource(registryCredentialRoutes, {
        list: 'listByOrganization',
        request: { path: { orgId: organizationId } }
    });
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState<RegistryCredential | null>(null);

    const rows = credentials.data ?? [];

    return (
        <>
            <SettingsSection
                title='Container registries'
                description='Credentials Docker uses to pull private images, one per registry. Without an entry for ghcr.io, Quantum falls back to the connected GitHub account.'
            >
                {rows.length === 0 && !credentials.loading && (
                    <p className='px-4 py-3 text-muted'>No registry credentials yet. Public images need none.</p>
                )}

                {rows.map((credential) => (
                    <SettingsRow
                        key={credential.id}
                        title={<span className='font-mono'>{credential.registry}</span>}
                        description={credential.username}
                        action={(
                            <Button
                                isIconOnly
                                size='sm'
                                variant='ghost'
                                aria-label={`Remove credentials for ${credential.registry}`}
                                onPress={() => setRemoving(credential)}
                            >
                                <Trash2 aria-hidden='true' />
                            </Button>
                        )}
                    />
                ))}

                {credentials.error !== undefined && <InlineError className='px-4 py-3'>{copy(credentials.error)}</InlineError>}

                <div className='px-2.5 py-2'>
                    <Button size='sm' variant='ghost' onPress={() => setAdding(true)}>
                        Add registry
                    </Button>
                </div>
            </SettingsSection>

            <AddRegistryDialog
                isOpen={adding}
                onClose={() => setAdding(false)}
                onAdd={(body) => credentials.create({ path: { orgId: organizationId }, body })}
            />

            <DeleteConfirmDialog
                isOpen={removing !== null}
                title='Remove registry credentials'
                description={removing === null
                    ? ''
                    : `Images from ${removing.registry} will be pulled anonymously from now on. Running containers are not affected.`}
                confirmLabel='Remove'
                entityId={removing?.id ?? null}
                remove={(id) => registryCredentialApi.remove({ path: { id } })}
                getErrorMessage={copy}
                onClose={() => setRemoving(null)}
                onRemoved={credentials.refresh}
            />
        </>
    );
};

export default RegistrySection;
