'use client'

import { useState, useEffect, useRef } from "react";
import { addFeatureFlag, enableGlobalAccess, enableUserAccess } from "../server/feature-flag-server-actions";
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
  users: Users[] | undefined;
  moreData: boolean | undefined;
  page: Number | undefined;
  currentFlagId: string | undefined;
  searchQuery: string | undefined;
}

type Errors =
  'Unable to update global access'
  | 'Unable to update users flag'
  | 'Unable to add feature flag'
  | 'Flag already exists'

const AVATAR_COLORS = ['#8B5E3C', '#4A7C6F', '#6B5E8B', '#8B4A4A', '#4A6B8B', '#6B8B4A', '#8B6B4A', '#4A8B6B']

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const FeatureFlagHome = ({ featureFlags, users, moreData, page, currentFlagId, searchQuery }: FeatureFlagHomeProps) => {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef<boolean>(false);

  const [featFlags, setFeatFlags] = useState<FeatureFlags[]>(featureFlags)
  const [featUsers, setFeatUsers] = useState<Users[]>(users ?? [])
  const [studentLookup, setStudentLookup] = useState<string>(searchQuery ?? '')
  const [error, setError] = useState<Errors>('' as Errors)
  const [currentFlag, setCurrentFlag] = useState<string>(currentFlagId ?? '')
  const [currentPage, setCurrentPage] = useState<Number>(page ?? 1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [flagSearch, setFlagSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newFlagName, setNewFlagName] = useState('')
  const [isAdding, setIsAdding] = useState(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [isGlobalToggling, setIsGlobalToggling] = useState<boolean>(false)
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null)

  const currentFlagData = featFlags.find(f => f.id === currentFlag)
  const isGlobalOn = currentFlagData?.global_enabled ?? false
  const filteredFlags = flagSearch.trim().length > 0 ? featFlags.filter(f => f.name.toLowerCase().includes(flagSearch.toLowerCase())) : featFlags

  const updateFilter = (page: number, flagId: string, search: string) => {
    const params = new URLSearchParams()
    if (flagId !== (currentFlagId ?? '') || search !== (searchQuery ?? '')) {
      params.set('page', String(1))
      if (flagId !== (currentFlagId ?? '')) {
        params.set('flagId', flagId)
      } else {
        params.set('searchQuery', search)
        params.set('flagId', flagId)
      }
    } else {
      params.set('page', String(page))
      params.set('searchQuery', search)
      params.set('flagId', flagId)
    }
    router.replace(`/home/feature-flags?${params.toString()}`)
  }

  // When query params change the server re-fetches and passes new props down; without this
  // the local state would remain stale and not reflect the updated data.
  // All props arrive atomically in the same render (Next.js streams at Suspense boundaries,
  // not at the prop level), so this effect fires once with all updated values together.
  useEffect(() => {

    setFeatFlags(featureFlags)
    setFeatUsers(users ?? [])
    setCurrentPage(page ?? 1)
    setCurrentFlag(currentFlagId ?? '')
    setStudentLookup(searchQuery ?? '')
    setIsSelecting(false)
    setIsAdding(false)
    setIsLoadingUsers(false)

  }, [featureFlags, users, page, currentFlagId, searchQuery])

  useEffect(() => {
    // Added so it doesnt run on initial render
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    setIsLoadingUsers(true)
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

  /*
   * enableGlobalAccess is idempotent — if the timeout fires before the response
   * arrives but the DB write went through, retrying with the same value is safe.
   * Note: withTimeout only bounds the client-side wait. A network stall between
   * the server and Supabase can still hang the action server-side indefinitely.
   */
  const toggleFlagGlobal = async (flagId: string, enabled: boolean) => {

    setIsGlobalToggling(true)

    try {
      const result = await withTimeout(enableGlobalAccess(flagId, enabled))
      if (!result.success) {
        setError('Unable to update global access')
        setIsGlobalToggling(false)
        return;
      }
      setFeatFlags(prev => prev.map(flag =>
        flag.id === flagId ? { ...flag, global_enabled: enabled } : flag
      ))
      setIsGlobalToggling(false)
    } catch {
      setIsGlobalToggling(false)
    }
  }

  /*
   * enableUserAccess is idempotent — if the timeout fires before the response
   * arrives but the DB write went through, retrying with the same value is safe.
   * Note: withTimeout only bounds the client-side wait. A network stall between
   * the server and Supabase can still hang the action server-side indefinitely.
   */
  const toggleFlagUser = async (userId: string, flagId: string, enabled: boolean) => {
    setTogglingUserId(userId)

    try {
      const result = await withTimeout(enableUserAccess(flagId, userId, enabled))
      if (!result.success) {
        setError('Unable to update users flag')
        setTogglingUserId(null)
        return
      }

      setTogglingUserId(null)
      setFeatUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, enabled } : user
      ))
    } catch {
      setTogglingUserId(null)
    }
  }

  const selectFlag = (flagId: string) => {
    setDropdownOpen(false)
    setFlagSearch('')
    setIsSelecting(true)
    updateFilter(1, flagId, '')
  }

 
  const handleAddFlag = async () => {
    try {
      const exists = featFlags.some((f) => f.name.toLowerCase().trim() === newFlagName.toLowerCase().trim())
      if (exists) {
        setError('Flag already exists')
        return
      }

      setIsAdding(true)
      const result = await withTimeout(addFeatureFlag(newFlagName))

      if (!result.success) {
        setError('Unable to add feature flag')
        setIsAdding(false)
        return;
      }

      setModalOpen(false)
      setNewFlagName('')
      setIsAdding(false)

      updateFilter(1, result.flagId, '')
    } catch {
      setError('Unable to add feature flag')
      setIsAdding(false)
    }
  }

  return (
    <div style={{ flex: 1, background: '#FDFAF6', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

      {/* Topbar */}
      <div style={{ height: 56, padding: '0 24px', borderBottom: '1px solid #E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#fff' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1510' }}>Feature Flags</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600, background: 'rgba(139,94,60,0.1)', color: '#8B5E3C' }}>⚑ Admin</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Flag picker dropdown — only when >1 flags */}
          {featFlags.length > 1 && (
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
          )}

          <button
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#8B5E3C', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}
          >
            <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span> Add Feature Flag
          </button>
        </div>
      </div>

      {/* Page body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {featFlags.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#A89070' }}>
            <span style={{ fontSize: 36 }}>⚑</span>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1510' }}>No feature flags yet</div>
            <div style={{ fontSize: 13 }}>Currently no feature flags. First add one.</div>
          </div>
        ) : (
          <>
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
                    loading={isGlobalToggling}
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

            {/* User list card — only when >1 flags */}
            {featFlags.length > 0 && (
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
                  {isLoadingUsers ? (
                    <UserListSkeleton />
                  ) : (
                    featUsers.map((user, i) => {
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
                              loading={togglingUserId === user.id}
                              onChange={checked => toggleFlagUser(user.id, currentFlag, checked)}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {isGlobalOn && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 20px', background: 'rgba(242,232,214,0.5)', borderTop: '1px solid #E8DDD0', fontSize: 12, color: '#A89070', flexShrink: 0 }}>
                    🔒 Enable individual access by turning off global above
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* Add Feature Flag Modal */}
      {modalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(28,21,16,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
        >
          <div
            style={{ background: '#fff', borderRadius: 14, padding: 28, width: 400, boxShadow: '0 16px 48px rgba(45,35,24,0.18)', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1510', marginBottom: 4 }}>New Feature Flag</div>
              <div style={{ fontSize: 12.5, color: '#A89070' }}>Enter a unique name for this flag.</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B5744', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flag name</label>
              <input
                autoFocus
                value={newFlagName}
                onChange={e => setNewFlagName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newFlagName.trim()) handleAddFlag() }}
                placeholder="e.g. new_dashboard"
                style={{ background: '#F2E8D6', border: '1.5px solid #E8DDD0', borderRadius: 8, padding: '9px 12px', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13, color: '#1C1510', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#8B5E3C')}
                onBlur={e => (e.target.style.borderColor = '#E8DDD0')}
              />
              {error === 'Flag already exists' && (
                <span style={{ fontSize: 12, color: '#C0392B' }}>A flag with this name already exists.</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => { setModalOpen(false); setNewFlagName(''); setError('' as Errors) }}
                style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid #E8DDD0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#6B5744', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddFlag}
                disabled={!newFlagName.trim() || isAdding}
                style={{ padding: '8px 16px', background: !newFlagName.trim() || isAdding ? 'rgba(139,94,60,0.4)' : '#8B5E3C', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#fff', cursor: !newFlagName.trim() || isAdding ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              >
                {isAdding ? 'Adding…' : 'Add Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserListSkeleton() {
  const rows = Array.from({ length: 6 })
  return (
    <>
      {rows.map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < rows.length - 1 ? '1px solid rgba(232,221,208,0.5)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F2E8D6', flexShrink: 0 }} />
            <div style={{ width: 120 + (i % 3) * 24, height: 13, borderRadius: 6, background: '#F2E8D6' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 62, height: 22, borderRadius: 20, background: '#F2E8D6' }} />
            <div style={{ width: 36, height: 20, borderRadius: 20, background: '#F2E8D6' }} />
          </div>
        </div>
      ))}
    </>
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

function Spinner({ size }: { size: 'lg' | 'sm' }) {
  const dim = size === 'lg' ? 18 : 14
  return (
    <>
      <style>{`@keyframes ff-spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: dim, height: dim, borderRadius: '50%', border: '2px solid rgba(139,94,60,0.2)', borderTopColor: '#8B5E3C', animation: 'ff-spin 0.7s linear infinite', flexShrink: 0 }} />
    </>
  )
}

function Toggle({
  checked,
  size,
  loading,
  onChange,
}:
  {
    checked: boolean;
    size: 'lg' | 'sm';
    loading?: boolean;
    onChange: (checked: boolean) => void
  }) {
  const isLg = size === 'lg'
  if (loading) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: isLg ? 48 : 36, height: isLg ? 26 : 20 }}>
        <Spinner size={size} />
      </div>
    )
  }
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
