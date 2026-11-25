import { Database, Layers, LayoutTemplate } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import Band from '@/landing/components/Band';
import FeatureGrid from '@/landing/components/FeatureGrid';
import FeatureCell from '@/landing/components/FeatureCell';
import GuideText from '@/landing/components/GuideText';

const LandingDeploy = () => (
    <Band id='deploy' label='Deploy'>
        <FeatureGrid columns={4} flush>
            <FeatureCell
                icon={GithubIcon}
                title='Repositories'
                body='Pick a repository and a branch. Quantum builds it from its Dockerfile, a prebuilt image or your own commands, and every push redeploys.'
            />
            <FeatureCell
                icon={Database}
                title='Databases'
                body='Postgres, MySQL, MariaDB, MongoDB or Redis, with backups and restore from the dashboard.'
            />
            <FeatureCell
                icon={LayoutTemplate}
                title='Templates'
                body='One click on n8n, Directus, WordPress, Uptime Kuma, Ollama and the rest of the catalogue.'
            />
            <FeatureCell
                icon={Layers}
                title='Compose stacks'
                body={<GuideText text='A compose file from one of your repositories, or pasted in. Services with `build:` are built on the server, the rest are pulled.' />}
            />
        </FeatureGrid>
    </Band>
);

export default LandingDeploy;
