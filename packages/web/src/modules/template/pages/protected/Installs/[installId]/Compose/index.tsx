import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { FileCode } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import InlineError from '@/shared/components/InlineError';
import MonacoEditor from '@/shared/components/MonacoEditor';
import SaveStatus from '@/shared/components/forms/SaveStatus';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { useAutosave } from '@/shared/hooks/forms/use-autosave';
import { templateInstallApi } from '@/modules/template/api/api';
import { composeErrorMessage } from '@/modules/template/utils/compose-error';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const AUTOSAVE_DELAY_MS = 1200;

interface ComposeEditorProps{
    installId: number;
    compose: string;
}

const ComposeEditor = ({ installId, compose: initial }: ComposeEditorProps) => {
    const [compose, setCompose] = useState(initial);
    const update = useMutation((text: string) => templateInstallApi.updateCompose({ path: { id: installId }, body: { compose: text } }));
    const saver = useAutosave<string>({
        value: compose,
        delayMs: AUTOSAVE_DELAY_MS,
        canSave: (text) => text.trim() !== '',
        save: async (text) => {
            await update.run(text);
        }
    });
    const error = update.error;

    return (
        <PageBody fill className='gap-4'>
            <p className='max-w-[60ch] text-muted'>
                Saved automatically once it parses. Redeploy to recreate the services from it. Variables set in
                the Environment tab take precedence over the ones written here.
            </p>

            <MonacoEditor
                value={compose}
                language='yaml'
                ariaLabel='Compose file'
                height='32rem'
                onChange={setCompose}
                header={(
                    <>
                        <FileCode aria-hidden='true' />
                        <span className='font-medium text-foreground'>Compose file</span>
                        <SaveStatus state={saver.state} className='ml-auto' />
                    </>
                )}
            />

            {error !== undefined && <InlineError>{composeErrorMessage(error)}</InlineError>}
        </PageBody>
    );
};

const InstallCompose = () => {
    const { installId } = useParams<{ installId: string }>();
    const id = installId !== undefined ? Number(installId) : undefined;
    const install = useOutletContext<TemplateInstall>();

    if(id === undefined) return null;

    if(install.compose === null){
        return (
            <CenterState className='flex-1 py-10'>
                <EmptyState
                    icon={FileCode}
                    title='Not a compose stack'
                    description='This installation was created from a template, so there is no compose file to edit.'
                />
            </CenterState>
        );
    }

    if(install.source !== null){
        const { owner, repo, branch, composePath } = install.source;
        return (
            <PageBody fill>
                <MonacoEditor
                    value={install.compose}
                    language='yaml'
                    ariaLabel='Compose file'
                    height='32rem'
                    isDisabled
                    onChange={() => undefined}
                    header={(
                        <>
                            <FileCode aria-hidden='true' />
                            <code className='font-mono text-xs text-foreground'>{composePath}</code>
                            <span className='text-subtle'>·</span>
                            <GithubIcon className='size-3.5 text-subtle' />
                            <span>
                                Read from <span className='font-mono text-xs'>{owner}/{repo}@{branch}</span> at every deploy. Edit it in the repository.
                            </span>
                        </>
                    )}
                />
            </PageBody>
        );
    }

    return <ComposeEditor key={id} installId={id} compose={install.compose} />;
};

export default InstallCompose;
