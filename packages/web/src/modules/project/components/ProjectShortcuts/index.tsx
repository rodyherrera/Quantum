import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { cn } from '@heroui/react';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useSidebarStore } from '@/shared/store/sidebar';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { SidebarHeading } from '@/shared/components/layout/AppSidebar';
import { navItemClass } from '@/shared/components/layout/sidebar-classes';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';

const MAX = 8;

/*
 * Every project of the organization, one click from its applications. A name is all a project has,
 * so the list only shows while the sidebar is wide enough to print it.
 */
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
    if(collapsed || list.length === 0) return null;

    const current = pathname === '/applications' ? params.get('project') : null;

    return (
        <div className='hidden flex-col gap-px lg:flex'>
            <SidebarHeading label='Your projects' collapsed={false} />

            {list.map((project) => (
                <NavLink
                    key={project.id}
                    to={`/applications?project=${project.id}`}
                    title={project.name}
                    className={cn(navItemClass(current === String(project.id), false), 'lg:pl-[2.0625rem]')}
                >
                    <span className='truncate'>{project.name}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default ProjectShortcuts;
