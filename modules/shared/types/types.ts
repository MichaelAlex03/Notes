

export const Permissions = {
    FeatureFlagManage: 'feature-flag.manage'
} as const

export type Permission = typeof Permissions[keyof typeof Permissions]

type SidebarLinks = 'Folders' | 'Feature Flags' | 'All Notes'

export type SidebarObjects = {
    name: SidebarLinks,
    visible: boolean;
    href: string;
}