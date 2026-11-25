import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { Theme } from '@/shared/utils/theme';

loader.config({ monaco });

/* Monaco only takes hex colours, so these mirror the tokens in index.css. Syntax is greys, like the rest. */
const PALETTE = {
    light: {
        base: 'vs',
        surface: '#ffffff',
        overlay: '#ffffff',
        foreground: '#1b1c20',
        muted: '#5a5b65',
        subtle: '#8c8d97',
        separator: '#e8e8ec',
        border: '#dcdce2',
        accent: '#1b1c20',
        key: '#1b1c20',
        string: '#5a5b65',
        literal: '#3d3e46',
        comment: '#a5a6ae'
    },
    dark: {
        base: 'vs-dark',
        surface: '#131418',
        overlay: '#18191d',
        foreground: '#ececef',
        muted: '#a2a3ac',
        subtle: '#6c6d77',
        separator: '#212227',
        border: '#2b2c32',
        accent: '#ececef',
        key: '#ececef',
        string: '#a2a3ac',
        literal: '#c9cad1',
        comment: '#5e606a'
    }
} as const;

const THEMES: Theme[] = ['light', 'dark'];

export const editorTheme = (theme: Theme): string => `quantum-${theme}`;

const hex = (color: string): string => color.slice(1);

export const defineEditorThemes = (instance: typeof monaco) => {
    for(const theme of THEMES){
        const palette = PALETTE[theme];

        instance.editor.defineTheme(editorTheme(theme), {
            base: palette.base,
            inherit: true,
            rules: [
                { token: '', foreground: hex(palette.foreground) },
                { token: 'string', foreground: hex(palette.string) },
                { token: 'string.yaml', foreground: hex(palette.string) },
                { token: 'number', foreground: hex(palette.literal) },
                { token: 'keyword', foreground: hex(palette.literal) },
                { token: 'comment', foreground: hex(palette.comment), fontStyle: 'italic' },
                { token: 'type', foreground: hex(palette.key), fontStyle: 'bold' },
                { token: 'operators', foreground: hex(palette.subtle) },
                { token: 'delimiter', foreground: hex(palette.subtle) }
            ],
            colors: {
                'editor.background': palette.surface,
                'editor.foreground': palette.foreground,
                'editorGutter.background': palette.surface,
                'editorLineNumber.foreground': palette.subtle,
                'editorLineNumber.activeForeground': palette.muted,
                'editorCursor.foreground': palette.accent,
                'editor.selectionBackground': `${palette.accent}30`,
                'editor.inactiveSelectionBackground': `${palette.accent}18`,
                'editor.lineHighlightBorder': '#00000000',
                'editorIndentGuide.background1': palette.separator,
                'editorIndentGuide.activeBackground1': palette.border,
                'editorWidget.background': palette.overlay,
                'editorWidget.border': palette.border,
                'editorSuggestWidget.selectedBackground': `${palette.accent}1f`,
                'focusBorder': palette.border,
                'scrollbarSlider.background': `${palette.border}b3`,
                'scrollbarSlider.hoverBackground': palette.border,
                'scrollbarSlider.activeBackground': palette.subtle
            }
        });
    }
};
