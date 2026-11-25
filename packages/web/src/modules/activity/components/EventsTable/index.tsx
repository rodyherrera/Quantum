import { Chip } from '@heroui/react';
import ListGroup from '@/shared/components/list/ListGroup';
import ListRow from '@/shared/components/list/ListRow';
import { StatusGlyph } from '@/shared/components/StatusDot';
import { activityLevelColor, activityLevelLabel } from '@/modules/activity/utils/level';
import { groupByDay } from '@/modules/activity/utils/event-days';
import { formatClock, formatDate } from '@/shared/utils/format-date';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const EventRow = ({ event }: { event: ActivityEvent }) => (
    <ListRow className='grid-cols-[0.875rem_minmax(0,1fr)_4rem] py-2 sm:grid-cols-[0.875rem_minmax(0,1fr)_auto_4rem]'>
        <span title={activityLevelLabel(event.level)}>
            <StatusGlyph color={activityLevelColor(event.level)} isTransient={event.level === ActivityLevel.Progress} />
            <span className='sr-only'>{activityLevelLabel(event.level)}</span>
        </span>

        <p className='min-w-0 break-words'>
            <span className='text-foreground'>{event.title}</span>
            {event.message !== '' && <span className='ml-2 text-muted'>{event.message}</span>}
        </p>

        <span className='hidden min-w-0 max-w-56 sm:block'>
            {event.source !== null && <Chip size='sm' className='max-w-full font-mono text-[0.6875rem]'>{event.source}</Chip>}
        </span>

        <time dateTime={event.ts} title={formatDate(event.ts)} className='text-right text-xs tabular-nums text-subtle'>
            {formatClock(event.ts)}
        </time>
    </ListRow>
);

interface EventsTableProps{
    events: ActivityEvent[];
}

/* The feed one day at a time, newest first. */
const EventsTable = ({ events }: EventsTableProps) => (
    <div>
        {groupByDay(events).map((day) => (
            <ListGroup key={day.key} label={day.label} count={day.events.length}>
                {day.events.map((event) => <EventRow key={event.id} event={event} />)}
            </ListGroup>
        ))}
    </div>
);

export default EventsTable;
