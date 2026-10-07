'use client'

import { useRouter } from 'next/navigation'

export default function HomeError() {
    const router = useRouter()

    const signOut = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.replace('/auth/sign-in')
    }

    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: '#FDFAF6' }}>
            <div style={{ textAlign: 'center', maxWidth: 340 }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1510', marginBottom: 8 }}>Session expired</div>
                <p style={{ fontSize: 13, color: '#A89070', lineHeight: 1.6, marginBottom: 24 }}>
                    We couldn't load your permissions. Sign out and back in to refresh your session.
                </p>
                <button
                    onClick={signOut}
                    style={{ padding: '9px 20px', background: '#2D2318', color: '#E8D5B7', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                    Sign out
                </button>
            </div>
        </div>
    )
}
