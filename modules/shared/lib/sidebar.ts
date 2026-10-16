import { Permission, SidebarObjects } from "../types/types";

export const filterAllowableTabs = (permissions: Permission[]): SidebarObjects[] => {

    const SIDEBAR_NAVS: SidebarObjects[] = [
        {
            name: 'All Notes',
            visible: true,
            href: '/home'
        },
        {
            name: 'Folders',
            visible: true,
            href: '/home/folders'
        },
        {
            name: 'Feature Flags',
            visible: permissions.includes('feature-flag.manage'),
            href: '/home/feature-flags'
        },
        {
            name: 'Permissions',
            visible: permissions.includes('permissions.manage'),
            href: '/home/permissions'
        }
    ]


    return SIDEBAR_NAVS.filter((s) => s.visible === true)
}