import { Table } from '@heroui/react';
import StatusDot from '@/shared/components/StatusDot';
import { activityLevelColor, activityLevelLabel } from '@/modules/activity/utils/level';
import { formatDate } from '@/shared/utils/format-date';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

interface EventsTableProps{
    events: ActivityEvent[];
}

const EventsTable = ({ events }: EventsTableProps) => (
    <Table>
        <Table.ScrollContainer>
            <Table.Content aria-label='Events'>
                <Table.Header>
                    <Table.Column>Level</Table.Column>
                    <Table.Column isRowHeader>Event</Table.Column>
                    <Table.Column>Source</Table.Column>
                    <Table.Column>Time</Table.Column>
                </Table.Header>

                <Table.Body>
                    {events.map((event) => (
                        <Table.Row key={event.id}>
                            <Table.Cell>
                                <StatusDot
                                    color={activityLevelColor(event.level)}
                                    label={activityLevelLabel(event.level)}
                                    isTransient={event.level === ActivityLevel.Progress}
                                />
                            </Table.Cell>

                            <Table.Cell>
                                <div className='flex max-w-[560px] flex-col gap-0.5'>
                                    <span className='font-medium text-foreground'>{event.title}</span>
                                    {}
                                    {event.message !== '' && (
                                        <span className='break-words text-[0.8125rem] text-muted'>{event.message}</span>
                                    )}
                                </div>
                            </Table.Cell>

                            <Table.Cell>
                                <span className='text-[0.8125rem] text-muted'>{event.source ?? '—'}</span>
                            </Table.Cell>

                            <Table.Cell>{formatDate(event.ts)}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
    </Table>
);

export default EventsTable;
