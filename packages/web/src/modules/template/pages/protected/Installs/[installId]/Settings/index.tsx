import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Input, TextField } from '@heroui/react';
import PageBody from '@/shared/components/layout/PageBody';
import SettingsRow from '@/shared/components/SettingsRow';
import EntitySelect from '@/shared/components/EntitySelect';
import ErrorState from '@/shared/components/ErrorState';
import SaveStatus from '@/shared/components/forms/SaveStatus';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import EnvironmentVariablesEditor from '@/shared/components/EnvironmentVariablesEditor';
import Panel from '@/modules/template/components/Panel';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useAutosave } from '@/shared/hooks/forms/use-autosave';
import { templateInstallApi } from '@/modules/template/api/api';
import { DEPLOY_TRIGGERS, deployTriggerLabel } from '@/modules/template/utils/deploy-trigger';
import { templateErrorMessages } from '@/modules/template/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { StackDeployTrigger, StackSource, TemplateInstall } from '@quantum/contracts/modules/template/domain';
import type { UpdateStackSourceInput } from '@quantum/contracts/modules/template/http';

const copy = errorCopy(templateErrorMessages);

const CONTROL = 'w-64 max-w-full';

interface SourceSectionProps{
    installId: number;
    source: StackSource;
}

const SourceSection = ({ installId, source }: SourceSectionProps) => {
    const [form, setForm] = useState<UpdateStackSourceInput>({ branch: source.branch, composePath: source.composePath, deployOn: source.deployOn });
    const saver = useAutosave<UpdateStackSourceInput>({
        value: form,
        canSave: (value) => value.branch.trim() !== '' && value.composePath.trim() !== '',
        save: async (value) => {
            await templateInstallApi.updateSource({ path: { id: installId }, body: value });
        }
    });

    return (
        <Panel title='Source' description='Where the compose file comes from. Changes apply on the next deploy.' aside={<SaveStatus state={saver.state} />}>
            <SettingsRow
                title='Repository'
                description='Quantum reads the compose file from it on every deploy.'
                action={(
                    <a
                        href={`https://github.com/${source.owner}/${source.repo}`}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-2 font-mono text-xs text-foreground underline-offset-4 hover:underline'
                    >
                        <GithubIcon className='size-3.5 text-subtle' />
                        {source.owner}/{source.repo}
                    </a>
                )}
            />

            <SettingsRow
                title='Branch'
                action={(
                    <TextField
                        aria-label='Branch'
                        value={form.branch}
                        onChange={(branch) => setForm((current) => ({ ...current, branch }))}
                        validationBehavior='aria'
                        fullWidth
                        className={CONTROL}
                    >
                        <Input className='font-mono' autoComplete='off' />
                    </TextField>
                )}
            />

            <SettingsRow
                title='Compose file'
                action={(
                    <TextField
                        aria-label='Compose file'
                        value={form.composePath}
                        onChange={(composePath) => setForm((current) => ({ ...current, composePath }))}
                        validationBehavior='aria'
                        fullWidth
                        className={CONTROL}
                    >
                        <Input className='font-mono' autoComplete='off' />
                    </TextField>
                )}
            />

            <SettingsRow
                title='Deploy on'
                action={(
                    <div className={CONTROL}>
                        <EntitySelect
                            items={DEPLOY_TRIGGERS}
                            getKey={(entry) => entry}
                            getLabel={(entry) => deployTriggerLabel(entry, form.branch)}
                            value={form.deployOn}
                            onChange={(key) => setForm((current) => ({ ...current, deployOn: key as StackDeployTrigger }))}
                            ariaLabel='Deploy on'
                        />
                    </div>
                )}
            />
        </Panel>
    );
};

const InstallSettings = () => {
    const { installId } = useParams<{ installId: string }>();
    const id = installId !== undefined ? Number(installId) : undefined;
    const install = useOutletContext<TemplateInstall>();
    const variables = useQuery((templateInstallId: number) => templateInstallApi.variables({ path: { id: templateInstallId } }), [id]);

    if(id === undefined || install.compose === null) return null;

    return (
        <PageBody className='flex max-w-[52rem] flex-col gap-6'>
            {install.source !== null && <SourceSection installId={id} source={install.source} />}

            {variables.loading && <FieldsSkeleton rows={2} />}

            {variables.error !== undefined && (
                <ErrorState title='Could not load the variables' description={copy(variables.error)} onRetry={variables.reload} />
            )}

            {!variables.loading && variables.error === undefined && (
                <EnvironmentVariablesEditor
                    title='Variables'
                    variables={variables.data ?? {}}
                    save={(next) => templateInstallApi.updateVariables({ path: { id }, body: { variables: next } })}
                    getErrorMessage={copy}
                    description='Values for the ${VAR} placeholders in the compose file. Saved automatically, applied on the next deploy.'
                    emptyDescription='The compose file uses no ${VAR} placeholders yet, or none needs a value.'
                    fills={false}
                />
            )}
        </PageBody>
    );
};

export default InstallSettings;
