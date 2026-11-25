import { useState } from 'react';
import { Chip, ComboBox, Input, Label, ListBox, ListBoxItem } from '@heroui/react';
import EmptyState from '@/shared/components/EmptyState';
import ConnectGithubButton from '@/modules/github/components/ConnectGithubButton';
import type { GithubAccount, GithubRepository } from '@quantum/contracts/modules/github/domain';

const PACKAGES_SCOPE = 'read:packages';

interface RepositoryPickerProps{
    repositories: GithubRepository[];
    account?: GithubAccount | null;
    onSelect: (repository: GithubRepository) => void;
}

const RepositoryPicker = ({ repositories, account = null, onSelect }: RepositoryPickerProps) => {
    const [query, setQuery] = useState('');
    const scopes = account?.scopes ?? [];
    const missingPackages = scopes.length > 0 && !scopes.includes(PACKAGES_SCOPE);

    if(repositories.length === 0){
        return (
            <EmptyState
                title='No repositories found'
                description='Push a repository to your GitHub account to import it here.'
            />
        );
    }

    const needle = query.trim().toLowerCase();
    const visible = needle === ''
        ? repositories
        : repositories.filter((repository) => repository.fullName.toLowerCase().includes(needle));

    return (
        <div className='flex w-full flex-col gap-1.5'>
            <Label id='repository-picker-label'>Repository</Label>

            <ComboBox
                aria-labelledby='repository-picker-label'
                inputValue={query}
                onInputChange={setQuery}
                onSelectionChange={(key) => {
                    const repository = repositories.find((candidate) => candidate.fullName === key);
                    if(repository !== undefined) onSelect(repository);
                }}
                allowsEmptyCollection
                fullWidth
            >
                <ComboBox.InputGroup>
                    <Input placeholder='Search your repositories…' autoComplete='off' />
                    <ComboBox.Trigger />
                </ComboBox.InputGroup>

                <ComboBox.Popover>
                    <ListBox
                        aria-labelledby='repository-picker-label'
                        renderEmptyState={() => (
                            <EmptyState title='No matches' description='Try a different search term.' compact />
                        )}
                    >
                        {visible.map((repository) => (
                            <ListBoxItem
                                key={repository.fullName}
                                id={repository.fullName}
                                textValue={repository.fullName}
                            >
                                <div className='flex w-full items-center gap-2.5 text-left'>
                                    <span className='min-w-0 flex-1 truncate font-medium'>{repository.fullName}</span>
                                    {repository.private && (
                                        <Chip size='sm'>
                                            Private
                                        </Chip>
                                    )}
                                </div>
                            </ListBoxItem>
                        ))}
                    </ListBox>
                </ComboBox.Popover>
            </ComboBox>

            <p className='text-xs text-subtle'>
                {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'} available. Type to narrow them down.
                {account?.organizationAccessUrl && (
                    <>
                        {' '}Missing an organization&apos;s repositories?{' '}
                        <a
                            href={account.organizationAccessUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='text-muted underline underline-offset-2 transition-colors hover:text-foreground motion-reduce:transition-none'
                        >
                            Grant Quantum access to it on GitHub
                        </a>
                        .
                    </>
                )}
            </p>

            {missingPackages && (
                <div className='mt-3 flex flex-wrap items-start gap-3 rounded-lg border border-separator bg-surface-secondary px-3 py-2.5'>
                    <p className='min-w-0 flex-1 basis-64 text-muted'>
                        This connection was made before Quantum asked for package access, so private GitHub Container Registry
                        images will not pull. Reconnect once to grant it.
                    </p>
                    <ConnectGithubButton label='Reconnect GitHub' />
                </div>
            )}
        </div>
    );
};

export default RepositoryPicker;
