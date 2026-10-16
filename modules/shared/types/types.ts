

export const Permissions = {
    FeatureFlagManage: 'feature-flag.manage',
    PermissionsManage: 'permissions.manage'
} as const

export type Permission = typeof Permissions[keyof typeof Permissions]

type SidebarLinks = 'Folders' | 'Feature Flags' | 'All Notes' | 'Permissions'

export type SidebarObjects = {
    name: SidebarLinks,
    visible: boolean;
    href: string;
}