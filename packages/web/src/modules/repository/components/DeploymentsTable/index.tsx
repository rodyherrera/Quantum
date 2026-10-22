import { Button, Table } from '@heroui/react';
import { ExternalLink } from 'lucide-react';
import StatusDot from '@/shared/components/StatusDot';
import { deploymentStatusColor, deploymentStatusLabel, isDeploymentInProgress } from '@/modules/repository/utils/deployment-status';
import { formatDate } from '@/shared/utils/format-date';
import type { Deployment } from '@quantum/contracts/modules/deployment/domain';

interface DeploymentsTableProps{
    deployments: Deployment[];
    onRollback: (deployment: Deployment) => void;
    onDelete: (deployment: Deployment) => void;
}

const DeploymentsTable = ({ deployments, onRollback, onDelete }: DeploymentsTableProps) => (
    <Table>
        <Table.ScrollContainer>
            <Table.Content aria-label='Deployments'>
                <Table.Header>
                    <Table.Column isRowHeader>Commit</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column>Date</Table.Column>
                    <Table.Column>URL</Table.Column>
                    <Table.Column><span className='sr-only'>Actions</span></Table.Column>
                </Table.Header>

                <Table.Body>
                    {deployments.map((deployment) => (
                        <Table.Row key={deployment.id}>
                            <Table.Cell>
                                <div className='flex max-w-[420px] flex-col gap-1'>
                                    <span className='text-[0.8125rem] text-foreground'>
                                        {deployment.commit?.message ?? 'No commit recorded'}
                                    </span>

                                    {}
                                    {deployment.error !== null && (
                                        <span className='block text-[0.8125rem] break-words text-[var(--danger)]'>
                                            {deployment.error}
                                        </span>
                                    )}
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <StatusDot
                                    color={deploymentStatusColor(deployment.status)}
                                    label={deploymentStatusLabel(deployment.status)}
                                    isTransient={isDeploymentInProgress(deployment.status)}
                                />
                            </Table.Cell>
                            <Table.Cell>{formatDate(deployment.createdAt)}</Table.Cell>
                            <Table.Cell>
                                {deployment.url ? (
                                    <a
                                        href={deployment.url}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='inline-flex items-center gap-1 font-mono text-[0.8125rem] transition-colors hover:text-foreground motion-reduce:transition-none'
                                    >
                                        <span className='max-w-[220px] truncate'>{deployment.url}</span>
                                        <ExternalLink aria-hidden='true' className='size-3.5 shrink-0' />
                                    </a>
                                ) : '—'}
                            </Table.Cell>
                            <Table.Cell>
                                <div className='flex justify-end gap-2'>
                                    <Button
                                        size='sm'
                                        variant='secondary'
                                        isDisabled={deployment.artifact === null}
                                        onPress={() => onRollback(deployment)}
                                    >
                                        Rollback
                                    </Button>
                                    <Button size='sm' variant='danger' onPress={() => onDelete(deployment)}>Delete</Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
    </Table>
);

export default DeploymentsTable;
