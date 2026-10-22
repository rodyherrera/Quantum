import { create } from 'zustand';
import typia from 'typia';
import { createPersistentStore } from '@/shared/store/persistent';
import type { Setup } from '@/modules/home/utils/guide';

interface GuideProgress{
    setup: Setup;
    ip: string;
    domain: string;
    done: string[];
}

export interface GuideState extends GuideProgress{
    choose: (setup: Setup) => void;
    setIp: (ip: string) => void;
    setDomain: (domain: string) => void;
    toggle: (step: string) => void;
}

const isProgress = typia.createIs<GuideProgress>();

const storage = createPersistentStore<GuideProgress>(
    'quantum.guide',
    (progress) => JSON.stringify(progress),
    (stored) => {
        if(stored === null) return null;

        const parsed: unknown = JSON.parse(stored);
        return isProgress(parsed) ? parsed : null;
    }
);

export const useGuideStore = create<GuideState>((set, get) => {
    const save = (patch: Partial<GuideProgress>) => {
        set(patch);

        const { setup, ip, domain, done } = get();
        storage.write({ setup, ip, domain, done });
    };

    return {
        ...(storage.read() ?? { setup: 'ip', ip: '', domain: '', done: [] }),
        choose: (setup) => save({ setup }),
        setIp: (ip) => save({ ip }),
        setDomain: (domain) => save({ domain }),
        toggle: (step) => {
            const { done } = get();
            save({ done: done.includes(step) ? done.filter((key) => key !== step) : [...done, step] });
        }
    };
});
