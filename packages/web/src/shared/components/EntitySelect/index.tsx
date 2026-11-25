import { ListBox, ListBoxItem, Select } from '@heroui/react';

interface EntitySelectProps<T>{
    items: T[];
    getKey: (item: T) => string | number;
    getLabel: (item: T) => string;
    value: string | number | null;
    onChange: (key: string | number) => void;
    placeholder?: string;
    ariaLabel?: string;
    isDisabled?: boolean;
    emptyLabel?: string;
}

const EntitySelect = <T,>({
    items,
    getKey,
    getLabel,
    value,
    onChange,
    placeholder,
    ariaLabel = 'Select',
    isDisabled = false,
    emptyLabel = 'Nothing to choose yet'
}: EntitySelectProps<T>) => (
    <Select
        aria-label={ariaLabel}
        placeholder={placeholder}
        selectedKey={value ?? null}
        isDisabled={isDisabled}
        onSelectionChange={(key) => onChange(key as string | number)}
    >
        <Select.Trigger>
            {}
            <Select.Value />
            <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
            <ListBox
                renderEmptyState={() => (
                    <p className='px-3 py-2.5 text-subtle'>{emptyLabel}</p>
                )}
            >
                {items.map((item) => (
                    <ListBoxItem key={getKey(item)} id={getKey(item)} textValue={getLabel(item)}>
                        {getLabel(item)}
                    </ListBoxItem>
                ))}
            </ListBox>
        </Select.Popover>
    </Select>
);

export default EntitySelect;
