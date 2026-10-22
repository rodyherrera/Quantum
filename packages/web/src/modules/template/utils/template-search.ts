import type { Template } from '@quantum/contracts/modules/template/domain';

export const matchesTemplate = (template: Template, needle: string): boolean =>
    needle === '' || `${template.name} ${template.slug} ${template.description ?? ''}`.toLowerCase().includes(needle);
