import { Chip } from '@heroui/react';
import { Database, FileCode, GitBranch, Layers, LayoutTemplate, Rocket } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import LandingSection from '@/modules/home/components/LandingSection';
import FeatureGrid from '@/modules/home/components/FeatureGrid';
import FeatureCell from '@/modules/home/components/FeatureCell';
import GuideText from '@/modules/home/components/GuideText';
import { MONO_CHIP } from '@/modules/home/utils/classes';

const TEMPLATES = ['n8n', 'Directus', 'Ollama'];

const LandingDeploy = () => (
    <LandingSection
        id='deploy'
        icon={Rocket}
        label='Deploy'
        title='Four ways in. One table to run them.'
        lead='Whatever you deploy lands in Applications, grouped by state, with the internal address other containers reach it at.'
    >
        <FeatureGrid columns={4}>
            <FeatureCell
                icon={GithubIcon}
                title='Repositories'
                body='Pick a repository and a branch. Quantum builds it from its Dockerfile, a prebuilt image or your own commands, and every push redeploys.'
            >
                <Chip className={MONO_CHIP}>
                    <GitBranch aria-hidden='true' />
                    main → :20001
                </Chip>
            </FeatureCell>

            <FeatureCell
                icon={Database}
                title='Databases'
                body='Postgres, MySQL, MariaDB, MongoDB or Redis, with backups and restore from the dashboard.'
            >
                <Chip className={MONO_CHIP}>172.30.0.2:5432</Chip>
            </FeatureCell>

            <FeatureCell
                icon={LayoutTemplate}
                title='Templates'
                body='One click on n8n, Directus, WordPress, Uptime Kuma, Ollama and the rest of the catalogue.'
            >
                {TEMPLATES.map((name) => <Chip key={name}>{name}</Chip>)}
            </FeatureCell>

            <FeatureCell
                icon={Layers}
                title='Compose stacks'
                body={<GuideText text='A compose file from one of your repositories, or pasted in. Services with `build:` are built on the server, the rest are pulled.' />}
            >
                <Chip className={MONO_CHIP}>
                    <FileCode aria-hidden='true' />
                    compose.yml · 4 services
                </Chip>
            </FeatureCell>
        </FeatureGrid>
    </LandingSection>
);

export default LandingDeploy;
