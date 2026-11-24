import {
    Activity,
    AppWindow,
    ArrowLeft,
    Building2,
    Code2,
    FolderClosed,
    Gauge,
    Inbox,
    KeyRound,
    LayoutTemplate,
    Settings,
    UserRound,
    Users
} from 'lucide-react';
import type { NavGroup, NavSection } from '@/shared/contracts/navigation';

export const navGroups: NavGroup[] = [
    {
        items: [
            { label: 'Applications', to: '/applications', icon: AppWindow },
            { label: 'Projects', to: '/projects', icon: FolderClosed },
            { label: 'Codespaces', to: '/codespaces', icon: Code2 }
        ]
    },
    {
        heading: 'Observe',
        items: [
            { label: 'Metrics', to: '/metrics', icon: Activity },
            { label: 'Usage', to: '/usage', icon: Gauge },
            { label: 'Events', to: '/events', icon: Inbox }
        ]
    },
    {
        heading: 'Catalogue',
        items: [
            { label: 'Templates', to: '/templates', icon: LayoutTemplate }
        ]
    }
];

export const settingsGroups: NavGroup[] = [
    { items: [{ label: 'Back to app', to: '/applications', icon: ArrowLeft }] },
    {
        heading: 'Account',
        items: [
            { label: 'Account', to: '/account', icon: UserRound },
            { label: 'Password', to: '/change-password', icon: KeyRound }
        ]
    },
    {
        heading: 'Organization',
        items: [
            { label: 'Organization', to: '/settings/organization', icon: Building2 },
            { label: 'Team', to: '/settings/team', icon: Users }
        ]
    }
];

export const settingsEntry: NavSection = { label: 'Settings', to: '/settings/organization', icon: Settings };
