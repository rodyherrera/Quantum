import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useSidebarStore } from '@/shared/store/sidebar';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { SidebarHeading } from '@/shared/components/layout/AppSidebar';
import { navItemClass, navLabelClass } from '@/shared/components/layout/sidebar-classes';
import { projectHue } from '@/modules/project/utils/project-hue';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';

const MAX = 8;

/* Every project of the organization, one click from its applications. */
const ProjectShortcuts = () => {
    const collapsed = useSidebarStore((state) => state.collapsed);
    const organizationId = useCurrentOrganizationId();
    const { pathname } = useLocation();
    const [params] = useSearchParams();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });

    const list = (projects.data ?? []).slice(0, MAX);
    if(list.length === 0) return null;

    const current = pathname === '/applications' ? params.get('project') : null;

    return (
        <div className='flex flex-col gap-px'>
            <SidebarHeading label='Your projects' collapsed={collapsed} />

            {list.map((project) => (
                <NavLink
                    key={project.id}
                    to={`/applications?project=${project.id}`}
                    title={project.name}
                    className={navItemClass(current === String(project.id), collapsed)}
                >
                    <span aria-hidden='true' className='grid size-[0.9375rem] shrink-0 place-items-center'>
                        <span className='size-2 rounded-[0.15625rem]' style={{ backgroundColor: projectHue(project.id) }} />
                    </span>
                    <span className={navLabelClass(collapsed)}>{project.name}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default ProjectShortcuts;
