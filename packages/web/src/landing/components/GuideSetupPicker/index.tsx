import { Description, Input, Label, TextField } from '@heroui/react';
import Segmented from '@/shared/components/layout/Segmented';
import type { SegmentedOption } from '@/shared/components/layout/Segmented';
import type { Setup } from '@/landing/utils/guide';

const SETUPS: SegmentedOption<Setup>[] = [
    { value: 'ip', label: 'A server, by its IP' },
    { value: 'domain', label: 'A server, with a domain' }
];

const ABOUT: Record<Setup, string> = {
    ip: "The quickest way online. You open Quantum at your server's IP address, like http://203.0.113.24:5050.",
    domain: 'Your own address with HTTPS, like https://quantum.example.com. You need a domain you can add a DNS record to.'
};

interface GuideSetupPickerProps{
    setup: Setup;
    ip: string;
    domain: string;
    onSetupChange: (setup: Setup) => void;
    onIpChange: (ip: string) => void;
    onDomainChange: (domain: string) => void;
}

const GuideSetupPicker = ({ setup, ip, domain, onSetupChange, onIpChange, onDomainChange }: GuideSetupPickerProps) => (
    <div className='mt-3 grid gap-5'>
        <div className='grid justify-items-start gap-2.5'>
            <Segmented label='Where Quantum will run' options={SETUPS} value={setup} onChange={onSetupChange} />
            <p className='max-w-[64ch] text-muted'>{ABOUT[setup]}</p>
        </div>

        <div className='grid max-w-[46rem] gap-4 md:grid-cols-2'>
            <TextField value={ip} onChange={onIpChange} validationBehavior='aria'>
                <Label>Your server's IP address</Label>
                <Input placeholder='203.0.113.24' autoComplete='off' spellCheck={false} inputMode='decimal' />
                <Description>Your provider's dashboard shows it. Type it and every command below includes it; until then they show YOUR_SERVER_IP.</Description>
            </TextField>

            {setup === 'domain' && (
                <TextField value={domain} onChange={onDomainChange} validationBehavior='aria'>
                    <Label>Your domain</Label>
                    <Input placeholder='quantum.example.com' autoComplete='off' spellCheck={false} />
                    <Description>The address you will open Quantum at. Until you type it, the commands show YOUR_DOMAIN.</Description>
                </TextField>
            )}
        </div>
    </div>
);

export default GuideSetupPicker;
