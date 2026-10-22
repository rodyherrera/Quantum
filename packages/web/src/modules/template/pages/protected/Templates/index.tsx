import { useMemo, useState } from 'react';
import { SplitSkeleton } from '@/shared/components/skeletons';
import { Boxes } from 'lucide-react';
import ListPageShell from '@/shared/components/ListPageShell';
import EmptyState from '@/shared/components/EmptyState';
import InstallTemplateDialog from '@/modules/template/components/InstallTemplateDialog';
import TemplateCatalogue from '@/modules/template/components/TemplateCatalogue';
import TemplateDetail from '@/modules/template/components/TemplateDetail';
import { useResource } from '@/shared/hooks/api/use-resource';
import { templateRoutes } from '@quantum/contracts/modules/template/routes';
import { templateErrorMessages } from '@/modules/template/utils/error-messages';
import { matchesTemplate } from '@/modules/template/utils/template-search';
import { errorCopy } from '@/shared/utils/error-copy';
import type { Template } from '@quantum/contracts/modules/template/domain';

const copy = errorCopy(templateErrorMessages);

const Templates = () => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Template | null>(null);
    const [installTarget, setInstallTarget] = useState<Template | null>(null);

    const templates = useResource(templateRoutes, { list: 'list' });

    const needle = search.trim().toLowerCase();
    const visible = useMemo(() => (templates.data ?? []).filter((template) => matchesTemplate(template, needle)), [templates.data, needle]);

    const shown = visible.find((template) => template.id === selected?.id) ?? visible[0] ?? null;

    if(templates.loading || templates.error !== undefined){
        return (
            <ListPageShell
                fill
                loading={templates.loading}
                skeleton={<SplitSkeleton />}
                error={templates.error}
                errorTitle='Could not load templates'
                getErrorDescription={copy}
                onRetry={templates.refresh}
            />
        );
    }

    return (
        <div className='flex h-full min-h-0 flex-col lg:flex-row'>
            <TemplateCatalogue
                templates={visible}
                search={search}
                onSearchChange={setSearch}
                selectedId={shown?.id ?? null}
                onSelect={setSelected}
            />

            <div className='min-h-0 flex-1'>
                {shown === null ? (
                    <div className='flex h-full items-center justify-center'>
                        <EmptyState
                            icon={Boxes}
                            title='No templates available'
                            description='Templates you can install into a project will appear here.'
                        />
                    </div>
                ) : (
                    <TemplateDetail template={shown} onInstall={() => setInstallTarget(shown)} />
                )}
            </div>

            <InstallTemplateDialog
                key={installTarget?.id ?? 'install'}
                template={installTarget}
                onClose={() => setInstallTarget(null)}
                onInstalled={templates.refresh}
            />
        </div>
    );
};

export default Templates;
