import EntitySelect from '@/shared/components/EntitySelect';
import type { TemplateInstallService } from '@quantum/contracts/modules/template/domain';

interface ServicePickerProps{
    services: TemplateInstallService[];
    value: string;
    onChange: (name: string) => void;
}

const ServicePicker = ({ services, value, onChange }: ServicePickerProps) => {
    if(services.length < 2) return null;

    return (
        <div className='w-48'>
            <EntitySelect
                items={services}
                getKey={(service) => service.name}
                getLabel={(service) => service.name}
                value={value}
                onChange={(key) => onChange(String(key))}
                ariaLabel='Service'
            />
        </div>
    );
};

export default ServicePicker;
