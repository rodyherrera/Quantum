import { Activity, KeyRound, Network, ScrollText, SquareTerminal } from 'lucide-react';
import VsCodeIcon from '@/shared/components/icons/VsCodeIcon';
import LandingSection from '@/modules/home/components/LandingSection';
import FeatureGrid from '@/modules/home/components/FeatureGrid';
import FeatureCell from '@/modules/home/components/FeatureCell';
import GuideText from '@/modules/home/components/GuideText';
import OperateLogs from '@/modules/home/components/OperateLogs';
import OperateMetrics from '@/modules/home/components/OperateMetrics';
import OperateAddresses from '@/modules/home/components/OperateAddresses';

const LandingOperate = () => (
    <LandingSection
        id='operate'
        index='02'
        label='Operate'
        title='Everything a running app needs.'
        lead='Start, stop, restart and redeploy from the top of every application. The rest lives in its tabs.'
    >
        <FeatureGrid columns={3} flush>
            <FeatureCell icon={ScrollText} title='Logs' body='Follow the output of one service at a time, live.'>
                <OperateLogs />
            </FeatureCell>

            <FeatureCell icon={SquareTerminal} title='Shell' body='A shell inside the container, right in the browser. On a stack, you pick the service.' />

            <FeatureCell
                icon={KeyRound}
                title='Environment'
                body={<GuideText text='Variables per service. They save as you type and apply on Redeploy, and a `.env` in the repository is imported on the first clone.' />}
            />

            <FeatureCell icon={Activity} title='Metrics' body='CPU, memory, network and processes for every container, with the recent samples charted.'>
                <OperateMetrics />
            </FeatureCell>

            <FeatureCell icon={VsCodeIcon} title='VS Code in the browser' body='A code-server that mounts the same files the application sees and joins its network, behind a password.' />

            <FeatureCell icon={Network} title='Internal addresses' body="Every container joins the organization's network, so apps reach each other without publishing a port.">
                <OperateAddresses />
            </FeatureCell>
        </FeatureGrid>
    </LandingSection>
);

export default LandingOperate;
