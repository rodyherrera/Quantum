import { useId } from 'react';
import { Description, Input, Label, TextField } from '@heroui/react';
import { Check } from 'lucide-react';
import type { Setup } from '@/modules/home/utils/guide';

const SETUPS: Array<{ key: Setup; title: string; body: string; address: string }> = [
    {
        key: 'ip',
        title: 'On a server',
        body: "The quickest way online. You open Quantum at your server's IP address.",
        address: 'http://203.0.113.24:5050'
    },
    {
        key: 'domain',
        title: 'On a server, with a domain',
        body: 'Your own address with HTTPS. You need a domain you can add a DNS record to.',
        address: 'https://quantum.example.com'
    }
];

interface GuideSetupPickerProps{
    setup: Setup;
    ip: string;
    domain: string;
    onSetupChange: (setup: Setup) => void;
    onIpChange: (ip: string) => void;
    onDomainChange: (domain: string) => void;
}

const GuideSetupPicker = ({ setup, ip, domain, onSetupChange, onIpChange, onDomainChange }: GuideSetupPickerProps) => {
    const id = useId();

    return (
        <div className='flex flex-col gap-10'>
            <fieldset>
                <legend className='sr-only'>Where Quantum will run</legend>

                <div className='lp-grid grid-cols-1 md:grid-cols-2'>
                    {SETUPS.map((entry) => (
                        <label key={entry.key} className='lp-option'>
                            <input
                                type='radio'
                                name='setup'
                                value={entry.key}
                                checked={entry.key === setup}
                                onChange={() => onSetupChange(entry.key)}
                                aria-labelledby={`${id}-${entry.key}`}
                                aria-describedby={`${id}-${entry.key}-body`}
                                className='sr-only'
                            />

                            <span className='flex items-center justify-between gap-4'>
                                <span id={`${id}-${entry.key}`} className='text-[1.0625rem] font-medium tracking-[-0.01em] text-white'>{entry.title}</span>
                                <span aria-hidden='true' className='lp-mark'>
                                    <Check className='size-3' />
                                </span>
                            </span>

                            <span id={`${id}-${entry.key}-body`} className='lp-body'>{entry.body}</span>
                            <span className='lp-index mt-auto pt-4'>{entry.address}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <div className='grid gap-6 md:grid-cols-2'>
                <TextField value={ip} onChange={onIpChange} validationBehavior='aria'>
                    <Label>Your server's IP address</Label>
                    <Input placeholder='203.0.113.24' autoComplete='off' spellCheck={false} inputMode='decimal' />
                    <Description>Your provider's dashboard shows it. Type it and every command below includes it; until then they show YOUR_SERVER_IP.</Description>
                </TextField>

                {setup === 'domain' && (
                    <TextField value={domain} onChange={onDomainChange} validationBehavior='aria'>
                        <Label>Your domain</Label>
                        <Input placeholder='quantum.example.com' autoComplete='off' spellCheck={false} />
                        <Description>The address you will open Quantum at, like quantum.example.com. Until you type it, the commands show YOUR_DOMAIN.</Description>
                    </TextField>
                )}
            </div>
        </div>
    );
};

export default GuideSetupPicker;
