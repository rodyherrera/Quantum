import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button, Chip, FieldError, Input, Label, TextField } from '@heroui/react';
import Modal from '@/shared/components/Modal';
import InlineError from '@/shared/components/InlineError';
import EntitySelect from '@/shared/components/EntitySelect';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { templateApi } from '@/modules/template/api/api';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { templateErrorMessages } from '@/modules/template/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { Template } from '@quantum/contracts/modules/template/domain';

const copy = errorCopy(templateErrorMessages);

const inputTypeOf = (type: string): string => {
    if(type === 'number') return 'number';
    if(type === 'secret') return 'password';
    return 'text';
};

interface InstallTemplateDialogProps{
    template: Template | null;
    onClose: () => void;
    onInstalled: () => void;
}

const InstallTemplateDialog = ({ template, onClose, onInstalled }: InstallTemplateDialogProps) => {
    const navigate = useNavigate();
    const organizationId = useCurrentOrganizationId();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } },
        enabled: template !== null
    });
    const [projectId, setProjectId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [inputs, setInputs] = useState<Record<string, string | number | boolean>>({});

    const install = useMutation((targetProjectId: number, body: { name: string; inputs: Record<string, string | number | boolean> }) =>
        templateApi.install({
            path: { projectId: targetProjectId },
            body: {
                templateId: template?.id ?? 0,
                name: body.name,
                inputs: body.inputs
            }
        }));

    const fields = (template?.inputsSchema ?? []).filter((def) => !def.generate);
    const generated = (template?.inputsSchema ?? []).length - fields.length;
    const services = Object.keys(template?.spec.services ?? {}).length;

    const selectProject = (id: number) => {
        setProjectId(id);
    };

    useEffect(() => {
        if(projectId !== null) return;
        const list = projects.data ?? [];
        const pick = list.find((project) => project.isDefault) ?? list[0];
        if(pick !== undefined) setProjectId(pick.id);
    }, [projectId, projects.data]);

    const setInput = (key: string, value: string | number | boolean) => {
        setInputs((previous) => ({ ...previous, [key]: value }));
    };

    const valueOf = (key: string, fallback: string | number | boolean | undefined): string =>
        inputs[key] !== undefined ? String(inputs[key]) : fallback !== undefined ? String(fallback) : '';

    const handleInstall = async () => {
        if(projectId === null || name.trim() === '') return;

        const installed = await install
            .run(projectId, { name: name.trim(), inputs })
            .then(() => true, () => false);

        if(!installed) return;
        onInstalled();
        onClose();
        navigate(`/applications?project=${projectId}`);
    };

    return (
        <Modal
            isOpen={template !== null}
            onOpenChange={(isOpen) => { if(!isOpen && !install.loading) onClose(); }}
            title={template === null ? 'Install template' : `Install ${template.name}`}
        >
            <div className='flex flex-col gap-4'>
                <TextField
                    value={name}
                    onChange={setName}
                    isDisabled={install.loading}
                    validationBehavior='aria'
                    fullWidth
                >
                    <Label>Name</Label>
                    <Input placeholder='my-service' autoComplete='off' />
                </TextField>

                <div className='flex flex-col gap-1.5'>
                    <Label>Project</Label>
                    <EntitySelect
                        items={projects.data ?? []}
                        getKey={(project) => project.id}
                        getLabel={(project) => project.name}
                        value={projectId}
                        onChange={(key) => selectProject(Number(key))}
                        placeholder='Select a project'
                        ariaLabel='Project'
                        isDisabled={install.loading || projects.loading}
                        emptyLabel='This organization has no projects yet'
                    />

                    {projects.data !== null && projects.data.length === 0 && (
                        <p className='text-muted'>
                            A template installs into a project, and this organization has none yet.{' '}
                            <RouterLink
                                to='/projects'
                                onClick={onClose}
                                className='text-foreground underline underline-offset-4 hover:no-underline'
                            >
                                Create one in Projects
                            </RouterLink>
                            .
                        </p>
                    )}
                </div>

                <div className='flex flex-wrap gap-1.5'>
                    <Chip>
                        {services} {services === 1 ? 'service' : 'services'}
                    </Chip>
                    {generated > 0 && (
                        <Chip>
                            {generated} {generated === 1 ? 'value' : 'values'} generated for you
                        </Chip>
                    )}
                </div>

                {fields.map((def) => (
                    <TextField
                        key={def.key}
                        type={inputTypeOf(def.type)}
                        value={valueOf(def.key, def.default)}
                        onChange={(value) => setInput(def.key, def.type === 'number' ? Number(value) : value)}
                        isDisabled={install.loading}
                        isRequired={def.required}
                        validationBehavior='aria'
                        fullWidth
                    >
                        <Label>{def.label}</Label>
                        <Input autoComplete='off' />
                        <FieldError />
                    </TextField>
                ))}

                {install.error !== undefined && <InlineError>{copy(install.error)}</InlineError>}

                <div className='mt-1 flex justify-end gap-2 border-t border-separator pt-4'>
                    <Button variant='ghost' isDisabled={install.loading} onPress={onClose}>Cancel</Button>
                    <Button
                        isPending={install.loading}
                        isDisabled={projectId === null || name.trim() === ''}
                        onPress={() => { void handleInstall(); }}
                    >
                        Install
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default InstallTemplateDialog;
