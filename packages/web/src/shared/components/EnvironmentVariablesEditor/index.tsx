import { useState } from 'react';
import { Button, Input, InputGroup, TextField } from '@heroui/react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import InlineError from '@/shared/components/InlineError';
import SaveStatus from '@/shared/components/forms/SaveStatus';
import GenerateSecretButton from '@/shared/components/forms/GenerateSecretButton';
import { isSecretVariable } from '@/shared/utils/secret-variable';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { useAutosave } from '@/shared/hooks/forms/use-autosave';
import {
    addEnvVarRow,
    envVarRowsFrom,
    envVarRowsToMap,
    removeEnvVarRow,
    updateEnvVarRow
} from '@/shared/utils/env-vars';
import type { EnvVarRow } from '@/shared/utils/env-vars';

const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-3';

interface EnvironmentVariableRowProps{
    row: EnvVarRow;
    onChange: (key: string, value: string) => void;
    onRemove: () => void;
}

const EnvironmentVariableRow = ({ row, onChange, onRemove }: EnvironmentVariableRowProps) => (
    <div className={ROW_GRID}>
        <TextField
            aria-label='Key'
            value={row.key}
            onChange={(key) => onChange(key, row.value)}
            validationBehavior='aria'
            fullWidth
        >
            <Input className='font-mono' placeholder='e.g. DATABASE_URL' autoComplete='off' />
        </TextField>

        <TextField
            aria-label='Value'
            value={row.value}
            onChange={(value) => onChange(row.key, value)}
            validationBehavior='aria'
            fullWidth
        >
            {isSecretVariable(row.key) ? (
                <InputGroup fullWidth>
                    <InputGroup.Input className='min-w-0 font-mono' placeholder='Value' autoComplete='off' />
                    <InputGroup.Suffix>
                        <GenerateSecretButton name={row.key} onGenerate={(value) => onChange(row.key, value)} />
                    </InputGroup.Suffix>
                </InputGroup>
            ) : (
                <Input className='font-mono' placeholder='Value' autoComplete='off' />
            )}
        </TextField>

        <Button
            isIconOnly
            variant='ghost'
            className='text-muted hover:text-foreground'
            aria-label={row.key === '' ? 'Remove variable' : `Remove ${row.key}`}
            onPress={onRemove}
        >
            <Trash2 aria-hidden='true' className='size-4' />
        </Button>
    </div>
);

interface EnvironmentVariablesEditorProps{
    variables: Record<string, string>;
    save: (variables: Record<string, string>) => Promise<unknown>;
    getErrorMessage: (error: Error) => string;
    title?: string;
    description: string;
    emptyDescription: string;
    fills?: boolean;
}

const EnvironmentVariablesEditor = ({
    variables,
    save,
    getErrorMessage,
    title = 'Environment Variables',
    description,
    emptyDescription,
    fills = true
}: EnvironmentVariablesEditorProps) => {
    const [rows, setRows] = useState<EnvVarRow[]>(() => envVarRowsFrom(variables));
    const update = useMutation((next: Record<string, string>) => save(next));
    const saver = useAutosave<Record<string, string>>({
        value: envVarRowsToMap(rows),
        save: async (next) => {
            await update.run(next);
        }
    });

    const add = () => setRows((current) => addEnvVarRow(current));

    return (
        <div className={`flex flex-col ${fills ? 'min-h-0 flex-1' : ''}`}>
            <div className='flex flex-wrap items-end justify-between gap-4'>
                <div>
                    <h2 className='text-[0.9375rem] font-medium text-foreground'>{title}</h2>
                    <p className='mt-1 max-w-[58ch] text-[0.8125rem] text-muted'>{description}</p>
                </div>

                <div className='flex flex-wrap items-center gap-4'>
                    <SaveStatus state={saver.state} />
                    <Button variant='secondary' onPress={add}>
                        <Plus aria-hidden='true' className='size-4' />
                        Add variable
                    </Button>
                </div>
            </div>

            <div className={`mt-6 flex flex-col gap-3 ${fills ? 'flex-1' : ''}`}>
                {rows.length === 0 ? (
                    <CenterState>
                        <EmptyState icon={KeyRound} title='No environment variables' description={emptyDescription}>
                            <Button onPress={add}>
                                <Plus aria-hidden='true' className='size-4' />
                                Add variable
                            </Button>
                        </EmptyState>
                    </CenterState>
                ) : (
                    <>
                        <div className={`${ROW_GRID} border-b border-border pb-2`}>
                            <span className='label-caps text-muted'>Key</span>
                            <span className='label-caps text-muted'>Value</span>
                            <span className='sr-only'>Actions</span>
                        </div>

                        {rows.map((row, index) => (
                            <EnvironmentVariableRow
                                key={index}
                                row={row}
                                onChange={(key, value) => setRows((current) => updateEnvVarRow(current, index, key, value))}
                                onRemove={() => setRows((current) => removeEnvVarRow(current, index))}
                            />
                        ))}
                    </>
                )}

                {update.error !== undefined && <InlineError>{getErrorMessage(update.error)}</InlineError>}
            </div>
        </div>
    );
};

export default EnvironmentVariablesEditor;
