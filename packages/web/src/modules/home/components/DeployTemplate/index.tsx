import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateCatalogue from '@/modules/template/components/TemplateCatalogue';
import TemplateDetail from '@/modules/template/components/TemplateDetail';
import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingWindow from '@/modules/home/components/LandingWindow';
import { matchesTemplate } from '@/modules/template/utils/template-search';
import { DEMO_TEMPLATES } from '@/modules/home/utils/demo/templates';

const DeployTemplate = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const needle = search.trim().toLowerCase();
    const visible = DEMO_TEMPLATES.filter((template) => matchesTemplate(template, needle));
    const shown = visible.find((template) => template.id === selectedId) ?? visible.find((template) => template.slug === 'n8n') ?? visible[0] ?? null;

    return (
        <LandingWindow title='Templates · Catalogue'>
            <LandingSheet isLive title='The template catalogue, try it' width={1040} height={640} path='/templates'>
                <div className='flex h-full min-h-0 flex-col lg:flex-row'>
                    <TemplateCatalogue
                        templates={visible}
                        search={search}
                        onSearchChange={setSearch}
                        selectedId={shown?.id ?? null}
                        onSelect={(template) => setSelectedId(template.id)}
                    />

                    <div className='min-h-0 flex-1'>
                        {shown !== null && <TemplateDetail template={shown} onInstall={() => navigate('/get-started')} />}
                    </div>
                </div>
            </LandingSheet>
        </LandingWindow>
    );
};

export default DeployTemplate;
