'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { filterAllowableTabs } from '../lib/sidebar'
import { Permission } from '../types/types'

interface SidebarProps {
    permissions: Permission[]
}

const ICONS: Record<string, string> = {
    'All Notes': '◈',
    'Folders': '📁',
    'Feature Flags': '⚑',
}

const ADMIN_LINKS = new Set(['Feature Flags'])

const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    margin: '0 6px',
    borderRadius: 6,
    fontSize: 12.5,
    color: active ? '#E8D5B7' : 'rgba(232,213,183,0.6)',
    background: active ? 'rgba(139,94,60,0.28)' : 'transparent',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'none',
})

const sectionLabelStyle: React.CSSProperties = {
    padding: '10px 14px 4px',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    color: 'rgba(232,213,183,0.35)',
}

export default function Sidebar({ permissions }: SidebarProps) {
    const pathname = usePathname()
    const visibleLinks = filterAllowableTabs(permissions)


    const mainLinks = visibleLinks.filter(l => !ADMIN_LINKS.has(l.name))
    const adminLinks = visibleLinks.filter(l => ADMIN_LINKS.has(l.name))

    return (
        <aside style={{ width: 200, minWidth: 200, background: '#2D2318', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid rgba(232,213,183,0.08)', flexShrink: 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E8D5B7', fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2, padding: '20px 14px 14px' }}>
                <span>✎</span> notes
            </div>

            {mainLinks.length > 0 && (
                <>
                    <div style={sectionLabelStyle}>Main</div>
                    {mainLinks.map(link => (
                        <Link key={link.href} href={link.href} style={linkStyle(pathname === link.href)}>
                            <span style={{ fontSize: 12, width: 15, textAlign: 'center' }}>{ICONS[link.name] ?? '◈'}</span>
                            {link.name}
                        </Link>
                    ))}
                </>
            )}

            {adminLinks.length > 0 && (
                <>
                    <div style={{ ...sectionLabelStyle, marginTop: 8 }}>Admin</div>
                    {adminLinks.map(link => (
                        <Link key={link.href} href={link.href} style={linkStyle(pathname === link.href)}>
                            <span style={{ fontSize: 12, width: 15, textAlign: 'center' }}>{ICONS[link.name] ?? '◈'}</span>
                            {link.name}
                        </Link>
                    ))}
                </>
            )}

            <div style={{ marginTop: 'auto', padding: 10, borderTop: '1px solid rgba(232,213,183,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 7, cursor: 'pointer' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8B5E3C', color: '#E8D5B7', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>MA</div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(232,213,183,0.6)' }}>Michael A.</span>
                </div>
            </div>
        </aside>
    )
}
