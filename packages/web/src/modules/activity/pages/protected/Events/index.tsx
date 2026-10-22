import { useEffect, useState } from 'react';
import { PageSkeleton } from '@/shared/components/skeletons';
import { Activity } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import ListPageShell from '@/shared/components/ListPageShell';
import EventsTable from '@/modules/activity/components/EventsTable';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useChannel } from '@/shared/hooks/socket/use-channel';
import { activityApi } from '@/modules/activity/api/api';
import { activityErrorMessages } from '@/modules/activity/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const copy = errorCopy(activityErrorMessages);

const Events = () => {
    const history = useQuery(activityApi.list, []);
    const [events, setEvents] = useState<ActivityEvent[]>([]);

    useEffect(() => {
        if(history.data) setEvents(history.data.items);
    }, [history.data]);

    const channel = useChannel('/activity/stream', {
        'activity.created': (event) => setEvents((previous) => [event, ...previous])
    });

    useEffect(() => {
        if(channel.status === 'open') channel.send('subscribe', {});
    }, [channel]);

    if(history.loading || history.error !== undefined){
        return (
            <ListPageShell
                fill
                loading={history.loading}
                skeleton={<PageSkeleton columns={4} />}
                error={history.error}
                errorTitle='Could not load events'
                getErrorDescription={copy}
                onRetry={history.reload}
            />
        );
    }

    return (
        <PageBody width='wide' height='full'>
            <PageHeader title='Events' />

            <div className='mt-6 flex flex-1 flex-col'>
                <ListPageShell
                    errorTitle='Could not load events'
                    getErrorDescription={copy}
                    onRetry={history.reload}
                    isEmpty={events.length === 0}
                    empty={{
                        icon: Activity,
                        title: 'No events yet',
                        description: 'Activity from your organization will show up here as it happens.'
                    }}
                >
                    <EventsTable events={events} />
                </ListPageShell>
            </div>
        </PageBody>
    );
};

export default Events;
