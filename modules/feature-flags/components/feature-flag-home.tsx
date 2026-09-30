'use client'

import { useState, useEffect, useRef } from "react";
import { enableGlobalAccess, enableUserAccess } from "../server/feature-flag-server-actions";
import { useRouter } from "next/navigation";

interface FeatureFlags {
  id: string,
  name: string,
  global_enabled: boolean
}

interface Users {
  id: string,
  first_name: string;
  last_name: string;
  enabled: boolean;
}

interface FeatureFlagHomeProps {
  featureFlags: FeatureFlags[];
  users: Users[];
  moreData: boolean;
  page: Number;
  currentFlagId: string;
  searchQuery: string | undefined;
}

type Error = 'Unable to update global access' | 'Unable to update users flag'

const AVATAR_COLORS = ['#8B5E3C', '#4A7C6F', '#6B5E8B', '#8B4A4A', '#4A6B8B', '#6B8B4A', '#8B6B4A', '#4A8B6B']

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const FeatureFlagHome = ({ featureFlags, users, moreData, page, currentFlagId, searchQuery }: FeatureFlagHomeProps) => {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [featFlags, setFeatFlags] = useState<FeatureFlags[]>(featureFlags)
  const [featUsers, setFeatUsers] = useState<Users[]>(users)
  const [studentLookup, setStudentLookup] = useState<string>(searchQuery ?? '')
  const [error, setError] = useState<Error>('' as Error)
  const [currentFlag, setCurrentFlag] = useState<string>(currentFlagId)
  const [currentPage, setCurrentPage] = useState<Number>(page)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [flagSearch, setFlagSearch] = useState('')

  const currentFlagData = featFlags.find(f => f.id === currentFlag)
  const isGlobalOn = currentFlagData?.global_enabled ?? false
  const filteredFlags = featFlags.filter(f => f.name.toLowerCase().includes(flagSearch.toLowerCase()))

  const updateFilter = (page: number, flagId: string, search: string) => {
    const params = new URLSearchParams()
    if (flagId !== currentFlag || search !== studentLookup) {
      params.set('page', String(1))
      if (flagId !== currentFlag) {
        params.set('flagId', flagId)
      } else {
        params.set('searchQuery', search)
      }
    } else {
      params.set('page', String(page))
    }
    router.replace(`/home/admin/feature-flags?${params.toString()}`)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateFilter(1, currentFlag, studentLookup)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [studentLookup])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setFlagSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleFlagGlobal = async (flagId: string, enabled: boolean) => {
    const result = await enableGlobalAccess(flagId, enabled)
    if (!result.success) {
      setError('Unable to update global access')
      return;
    } 
    setFeatFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, global_enabled: enabled } : flag
    ))
  }

  const toggleFlagUser = async (userId: string, flagId: string, enabled: boolean) => {
    const result = await enableUserAccess(flagId, userId, enabled)

    if (!result.success) {
      setError('Unable to update users flag')
      return
    }

    setFeatUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, enabled } : user
    ))
  }

  const selectFlag = (flagId: string) => {
    setCurrentFlag(flagId)
    setDropdownOpen(false)
    setFlagSearch('')
    updateFilter(1, flagId, studentLookup)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────── */}
      <aside style={{ width: 200, minWidth: 200, background: '#2D2318', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid rgba(232,213,183,0.08)', flexShrink: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E8D5B7', fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2, padding: '20px 14px 14px' }}>
          <span>✎</span> notes
        </div>

        <div style={{ padding: '10px 14px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(232,213,183,0.35)' }}>Main</div>

        {[{ icon: '◈', label: 'All Notes' }, { icon: '★', label: 'Starred' }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', margin: '0 6px', borderRadius: 6, fontSize: 12.5, color: 'rgba(232,213,183,0.6)', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ fontSize: 12, width: 15, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ padding: '10px 14px 4px', marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(232,213,183,0.35)' }}>Admin</div>

        {[
          { icon: '⚑', label: 'Feature Flags', active: true },
          { icon: '👥', label: 'Users', active: false },
          { icon: '📊', label: 'Analytics', active: false },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', margin: '0 6px', borderRadius: 6, fontSize: 12.5, color: item.active ? '#E8D5B7' : 'rgba(232,213,183,0.6)', background: item.active ? 'rgba(139,94,60,0.28)' : 'transparent', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ fontSize: 12, width: 15, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: 10, borderTop: '1px solid rgba(232,213,183,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 7, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8B5E3C', color: '#E8D5B7', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>MA</div>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(232,213,183,0.6)' }}>Michael A.</span>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <div style={{ flex: 1, background: '#FDFAF6', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ height: 56, padding: '0 24px', borderBottom: '1px solid #E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#fff' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1510' }}>Feature Flags</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600, background: 'rgba(139,94,60,0.1)', color: '#8B5E3C' }}>⚑ Admin</span>
          </div>

          {/* Flag picker dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', border: `1.5px solid ${dropdownOpen ? '#8B5E3C' : '#E8DDD0'}`, borderRadius: 8, cursor: 'pointer', userSelect: 'none', minWidth: 220, boxShadow: dropdownOpen ? '0 0 0 3px rgba(139,94,60,0.12)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#A89070' }}>Active flag</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1C1510', fontFamily: "'SF Mono', 'Fira Code', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentFlagData?.name ?? '—'}
                </span>
              </div>
              <StatusBadge on={isGlobalOn} />
              <span style={{ fontSize: 9, color: '#A89070', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
            </div>

            {dropdownOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #E8DDD0', borderRadius: 10, boxShadow: '0 8px 32px rgba(45,35,24,0.12), 0 2px 8px rgba(45,35,24,0.06)', minWidth: 260, zIndex: 100, overflow: 'hidden' }}>
                <input
                  autoFocus
                  value={flagSearch}
                  onChange={e => setFlagSearch(e.target.value)}
                  placeholder="⌕  Search flags…"
                  style={{ width: '100%', border: 'none', borderBottom: '1px solid #E8DDD0', padding: '10px 12px', fontFamily: 'inherit', fontSize: 12, color: '#6B5744', outline: 'none', background: '#F2E8D6' }}
                />
                {filteredFlags.map(flag => (
                  <FlagDropdownItem
                    key={flag.id}
                    flag={flag}
                    selected={flag.id === currentFlag}
                    onSelect={() => selectFlag(flag.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Page body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Global access card */}
          <div style={{ background: '#fff', border: `2px solid ${isGlobalOn ? 'rgba(45,106,79,0.35)' : '#E8DDD0'}`, borderRadius: 12, overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}>
            <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: isGlobalOn ? 'rgba(45,106,79,0.1)' : '#F2E8D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, transition: 'background 0.2s' }}>🌐</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1510', marginBottom: 3 }}>Global Access</div>
                  <div style={{ fontSize: 12.5, color: '#A89070', lineHeight: 1.5, maxWidth: 480 }}>
                    When enabled, <strong style={{ color: '#6B5744' }}>{currentFlagData?.name}</strong> is turned on for <strong style={{ color: '#6B5744' }}>all users</strong> automatically. Individual user overrides are disabled while global access is on.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <StatusBadge on={isGlobalOn} />
                <Toggle
                  checked={isGlobalOn}
                  size="lg"
                  onChange={checked => currentFlagData && toggleFlagGlobal(currentFlagData.id, checked)}
                />
              </div>
            </div>
            {isGlobalOn && (
              <div style={{ background: 'rgba(45,106,79,0.06)', borderTop: '1px solid rgba(45,106,79,0.15)', padding: '10px 22px', fontSize: 12, color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: 7 }}>
                🔒 Individual toggles are disabled — all users inherit global access.
              </div>
            )}
          </div>

          {/* User list card */}
          <div style={{ background: '#fff', border: '1px solid #E8DDD0', borderRadius: 12, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1510' }}>Individual Access</span>
                <span style={{ fontSize: 12, color: '#A89070' }}>{featUsers.length} users</span>
              </div>
              <input
                value={studentLookup}
                onChange={e => setStudentLookup(e.target.value)}
                placeholder="⌕  Search users…"
                disabled={isGlobalOn}
                style={{ background: '#F2E8D6', border: '1px solid #E8DDD0', borderRadius: 7, padding: '6px 10px', fontFamily: 'inherit', fontSize: 12, color: '#6B5744', outline: 'none', width: 180, opacity: isGlobalOn ? 0.45 : 1, cursor: isGlobalOn ? 'not-allowed' : 'text', transition: 'opacity 0.2s' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {featUsers.map((user, i) => {
                const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
                const color = getAvatarColor(user.id)
                return (
                  <div
                    key={user.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < featUsers.length - 1 ? '1px solid rgba(232,221,208,0.5)' : 'none', opacity: isGlobalOn ? 0.38 : 1, pointerEvents: isGlobalOn ? 'none' : 'auto', transition: 'opacity 0.2s, background 0.1s' }}
                    onMouseEnter={e => { if (!isGlobalOn) (e.currentTarget as HTMLDivElement).style.background = 'rgba(242,232,214,0.35)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{initials}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1510' }}>{user.first_name} {user.last_name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusBadge on={user.enabled} />
                      <Toggle
                        checked={user.enabled}
                        size="sm"
                        onChange={checked => toggleFlagUser(user.id, currentFlag, checked)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {isGlobalOn && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 20px', background: 'rgba(242,232,214,0.5)', borderTop: '1px solid #E8DDD0', fontSize: 12, color: '#A89070', flexShrink: 0 }}>
                🔒 Enable individual access by turning off global above
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function FlagDropdownItem({ flag, selected, onSelect }: { flag: FeatureFlags; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', cursor: 'pointer', background: selected ? 'rgba(139,94,60,0.08)' : hovered ? 'rgba(242,232,214,0.6)' : 'transparent', transition: 'background 0.1s' }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1C1510', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{flag.name}</div>
      <StatusBadge on={flag.global_enabled} />
    </div>
  )
}

function StatusBadge({ on }: { on: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: on ? 'rgba(45,106,79,0.1)' : 'rgba(168,144,112,0.12)', color: on ? '#2D6A4F' : '#7A6650', whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: on ? '#2D6A4F' : '#A89070', opacity: on ? 1 : 0.5, display: 'inline-block', flexShrink: 0 }} />
      {on ? 'Enabled' : 'Disabled'}
    </span>
  )
}

function Toggle({ checked, size, onChange }: { checked: boolean; size: 'lg' | 'sm'; onChange: (checked: boolean) => void }) {
  const isLg = size === 'lg'
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', flexShrink: 0, width: isLg ? 48 : 36, height: isLg ? 26 : 20 }}
    >
      <div style={{ position: 'absolute', inset: 0, background: checked ? '#2D6A4F' : 'rgba(168,144,112,0.3)', borderRadius: 20, transition: 'background 0.2s' }} />
      <div style={{ position: 'absolute', width: isLg ? 18 : 14, height: isLg ? 18 : 14, left: isLg ? 4 : 3, top: isLg ? 4 : 3, background: '#fff', borderRadius: '50%', transition: 'transform 0.2s', transform: checked ? `translateX(${isLg ? 22 : 16}px)` : 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
    </div>
  )
}

export default FeatureFlagHome
