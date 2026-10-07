import { Permission, SidebarObjects } from "../types/types";

export const filterAllowableTabs = (permissions: Permission[]): SidebarObjects[] => {

    const SIDEBAR_NAVS: SidebarObjects[] = [
        {
            name: 'All Notes',
            visible: permissions.includes('feature-flag.manage'),
            href: '/home'
        },
        {
            name: 'Folders',
            visible: permissions.includes('feature-flag.manage'),
            href: '/home/folders'
        },
        {
            name: 'Feature Flags',
            visible: permissions.includes('feature-flag.manage'),
            href: '/home/feature-flags'
        },
    ]


    return SIDEBAR_NAVS.filter((s) => s.visible === true)
}