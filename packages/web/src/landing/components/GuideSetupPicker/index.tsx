import { Input, Label, TextField } from '@heroui/react';
import Segmented from '@/shared/components/layout/Segmented';
import type { SegmentedOption } from '@/shared/components/layout/Segmented';
import type { Setup } from '@/landing/utils/guide';

const SETUPS: SegmentedOption<Setup>[] = [
    { value: 'ip', label: 'A server, by its IP' },
    { value: 'domain', label: 'A server, with a domain' }
];

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
        <div className='grid justify-items-start'>
            <Segmented label='Where Quantum will run' options={SETUPS} value={setup} onChange={onSetupChange} />
        </div>

        <div className='grid max-w-[46rem] gap-4 md:grid-cols-2'>
            <TextField value={ip} onChange={onIpChange} validationBehavior='aria'>
                <Label>Your server's IP address</Label>
                <Input placeholder='203.0.113.24' autoComplete='off' spellCheck={false} inputMode='decimal' />
            </TextField>

            {setup === 'domain' && (
                <TextField value={domain} onChange={onDomainChange} validationBehavior='aria'>
                    <Label>Your domain</Label>
                    <Input placeholder='quantum.example.com' autoComplete='off' spellCheck={false} />
                </TextField>
            )}
        </div>
    </div>
);

export default GuideSetupPicker;
