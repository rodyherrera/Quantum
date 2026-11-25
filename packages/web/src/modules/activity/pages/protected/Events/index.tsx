import { useEffect, useState } from 'react';
import { PageSkeleton } from '@/shared/components/skeletons';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import ViewTabs from '@/shared/components/layout/ViewTabs';
import ListPageShell from '@/shared/components/ListPageShell';
import EventsTable from '@/modules/activity/components/EventsTable';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useChannel } from '@/shared/hooks/socket/use-channel';
import { activityApi } from '@/modules/activity/api/api';
import { activityErrorMessages } from '@/modules/activity/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const copy = errorCopy(activityErrorMessages);

type LevelFilter = 'all' | ActivityLevel;

const VIEWS: { id: LevelFilter; label: string }[] = [
    { id: 'all', label: 'All events' },
    { id: ActivityLevel.Error, label: 'Errors' },
    { id: ActivityLevel.Warn, label: 'Warnings' },
    { id: ActivityLevel.Progress, label: 'In progress' },
    { id: ActivityLevel.Success, label: 'Succeeded' },
    { id: ActivityLevel.Info, label: 'Info' }
];

const countOf = (events: ActivityEvent[], level: LevelFilter): number =>
    level === 'all' ? events.length : events.filter((event) => event.level === level).length;

const Events = () => {
    const history = useQuery(activityApi.list, []);
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [level, setLevel] = useState<LevelFilter>('all');

    useEffect(() => {
        if(history.data) setEvents(history.data.items);
    }, [history.data]);

    const channel = useChannel('/activity/stream', {
        'activity.created': (event) => setEvents((previous) => [event, ...previous])
    });

    useEffect(() => {
        if(channel.status === 'open') channel.send('subscribe', {});
    }, [channel]);

    if(history.loading) return <PageSkeleton columns={4} />;

    const shown = level === 'all' ? events : events.filter((event) => event.level === level);

    return (
        <>
            <PageBar title='Events'>
                {history.error === undefined ? (
                    <ViewTabs
                        label='Level'
                        value={level}
                        onChange={setLevel}
                        items={VIEWS.map((view) => ({ ...view, count: countOf(events, view.id) }))}
                    />
                ) : undefined}
            </PageBar>

            <PageBody variant='flush' fill>
                <ListPageShell
                    error={history.error}
                    errorTitle='Could not load events'
                    getErrorDescription={copy}
                    onRetry={history.reload}
                    isEmpty={shown.length === 0}
                    empty={{
                        title: events.length === 0 ? 'No events yet' : 'No matches',
                        description: events.length === 0
                            ? 'Activity from your organization will show up here as it happens.'
                            : 'No events at this level. Show all events to see the rest.'
                    }}
                >
                    <EventsTable events={shown} />
                </ListPageShell>
            </PageBody>
        </>
    );
};

export default Events;
