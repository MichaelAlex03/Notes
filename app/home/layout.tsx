import { fetchUserPermissions } from '@/modules/shared/server/permissions.loader'
import Sidebar from '@/modules/shared/components/sidebar'

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
    const permissions = await fetchUserPermissions()

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <Sidebar permissions={permissions} />
            {children}
        </div>
    )
}
