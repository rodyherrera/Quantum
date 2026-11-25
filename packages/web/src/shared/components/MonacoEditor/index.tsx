import Editor from '@monaco-editor/react';
import { useThemeStore } from '@/shared/store/theme';
import { defineEditorThemes, editorTheme } from '@/shared/utils/monaco';
import type { ReactNode } from 'react';

const FONT_FAMILY = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FONT_SIZE = 12;
const LINE_HEIGHT = 20;
const TAB_SIZE = 2;
const SCROLLBAR_SIZE = 8;
const PADDING = 10;

interface MonacoEditorProps{
    value: string;
    language: string;
    ariaLabel: string;
    header?: ReactNode;
    height?: string;
    isDisabled?: boolean;
    onChange: (value: string) => void;
}

const MonacoEditor = ({ value, language, ariaLabel, header, height = '28rem', isDisabled = false, onChange }: MonacoEditorProps) => {
    const theme = useThemeStore((state) => state.theme);

    return (
        <div className='min-w-0 overflow-hidden rounded-lg border border-separator bg-surface transition-colors focus-within:border-accent motion-reduce:transition-none'>
            {header !== undefined && (
                <div className='flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 border-b border-separator px-4 py-2 text-muted [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-subtle'>
                    {header}
                </div>
            )}

            <Editor
                height={height}
                language={language}
                value={value}
                theme={editorTheme(theme)}
                beforeMount={defineEditorThemes}
                onChange={(next) => onChange(next ?? '')}
                options={{
                    ariaLabel,
                    readOnly: isDisabled,
                    domReadOnly: isDisabled,
                    fontFamily: FONT_FAMILY,
                    fontSize: FONT_SIZE,
                    lineHeight: LINE_HEIGHT,
                    tabSize: TAB_SIZE,
                    padding: { top: PADDING, bottom: PADDING },
                    lineNumbersMinChars: 3,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    renderLineHighlight: 'none',
                    overviewRulerLanes: 0,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        verticalScrollbarSize: SCROLLBAR_SIZE,
                        horizontalScrollbarSize: SCROLLBAR_SIZE
                    }
                }}
            />
        </div>
    );
};

export default MonacoEditor;
