import { useState } from 'react';
import { Button, cn, Input, TextField } from '@heroui/react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
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

const ROW_GRID = 'grid grid-cols-[minmax(7.5rem,0.8fr)_minmax(0,1.4fr)_5.25rem] items-center gap-x-1 px-1';

/* The inputs read as plain text until the row is hovered or the field is focused. */
const BLEND_INPUT = 'border-transparent bg-transparent font-mono hover:border-border focus:bg-field';

/* Generate and remove stay out of the way until the row is hovered or focused; touch screens always show them. */
const HOVER_ONLY = 'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none';

const ICON_BUTTON = 'size-7 text-subtle hover:text-foreground';

interface EnvironmentVariableRowProps{
    row: EnvVarRow;
    onChange: (key: string, value: string) => void;
    onRemove: () => void;
}

const EnvironmentVariableRow = ({ row, onChange, onRemove }: EnvironmentVariableRowProps) => {
    const [revealed, setRevealed] = useState(false);
    const secret = isSecretVariable(row.key);

    return (
        <div className={cn(ROW_GRID, 'group min-h-11 transition-colors hover:bg-default motion-reduce:transition-none')}>
            <TextField
                aria-label='Key'
                value={row.key}
                onChange={(key) => onChange(key, row.value)}
                validationBehavior='aria'
                fullWidth
            >
                <Input className={BLEND_INPUT} placeholder='e.g. DATABASE_URL' autoComplete='off' />
            </TextField>

            <TextField
                aria-label='Value'
                type={secret && !revealed ? 'password' : 'text'}
                value={row.value}
                onChange={(value) => onChange(row.key, value)}
                validationBehavior='aria'
                fullWidth
            >
                <Input className={BLEND_INPUT} placeholder='Value' autoComplete='off' />
            </TextField>

            <div className='flex items-center justify-end'>
                {secret && (
                    <>
                        <Button
                            isIconOnly
                            variant='ghost'
                            size='sm'
                            className={ICON_BUTTON}
                            aria-label={revealed ? `Hide ${row.key}` : `Show ${row.key}`}
                            onPress={() => setRevealed(!revealed)}
                        >
                            {revealed ? <EyeOff aria-hidden='true' /> : <Eye aria-hidden='true' />}
                        </Button>
                        <span className={cn('inline-flex', HOVER_ONLY)}>
                            <GenerateSecretButton name={row.key} onGenerate={(value) => onChange(row.key, value)} />
                        </span>
                    </>
                )}

                <Button
                    isIconOnly
                    variant='ghost'
                    size='sm'
                    className={cn(ICON_BUTTON, HOVER_ONLY)}
                    aria-label={row.key === '' ? 'Remove variable' : `Remove ${row.key}`}
                    onPress={onRemove}
                >
                    <Trash2 aria-hidden='true' />
                </Button>
            </div>
        </div>
    );
};

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
    title = 'Environment variables',
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
    const empty = rows.length === 0;

    return (
        <section className={cn('flex min-w-0 flex-col rounded-lg border border-separator bg-surface', fills && empty && 'min-h-0 flex-1')}>
            <header className='flex min-h-[2.625rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2'>
                <div className='min-w-0 flex-1 basis-64'>
                    <h3 className='font-semibold text-foreground'>{title}</h3>
                    <p className='mt-0.5 max-w-[60ch] text-xs text-subtle'>{description}</p>
                </div>

                <div className='flex shrink-0 items-center gap-3'>
                    <SaveStatus state={saver.state} />
                    <Button size='sm' variant='secondary' onPress={add}>
                        Add variable
                    </Button>
                </div>
            </header>

            {empty ? (
                <CenterState className='flex-1 border-t border-separator'>
                    <EmptyState title='No environment variables' description={emptyDescription} compact>
                        <Button size='sm' onPress={add}>
                            Add variable
                        </Button>
                    </EmptyState>
                </CenterState>
            ) : (
                <div className='border-t border-separator [&>*+*]:border-t [&>*+*]:border-separator'>
                    <div className={cn(ROW_GRID, 'h-8 text-xs font-medium text-subtle [&>span]:px-3')}>
                        <span>Key</span>
                        <span>Value</span>
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
                </div>
            )}

            {update.error !== undefined && (
                <InlineError className='border-t border-separator px-4 py-2.5'>{getErrorMessage(update.error)}</InlineError>
            )}
        </section>
    );
};

export default EnvironmentVariablesEditor;
