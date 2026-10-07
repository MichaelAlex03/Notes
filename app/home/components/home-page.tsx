'use client'

import { useState } from 'react'

type Folder = {
    id: string
    folder_name: string
    created_at: string
}

type Note = {
    id: string
    folder_id: string
    notes_content: string
    user_id: string
    created_at: string
    updated_at: string
}

function getNoteTitle(content: string): string {
    const first = content.split('\n')[0].replace(/^#+\s*/, '').trim()
    return first.slice(0, 60) || 'Untitled'
}

function getNotePreview(content: string): string {
    const lines = content.split('\n').filter(l => l.trim())
    return lines.slice(1, 4).join(' ').replace(/^#+\s*/gm, '').slice(0, 130)
}

function getRelativeTime(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (mins < 2) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function HomePage() {
    const [folders, setFolders] = useState<Folder[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedFolderId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const visibleNotes = selectedFolderId
        ? notes.filter(n => n.folder_id === selectedFolderId)
        : notes

    const headerTitle = selectedFolderId
        ? (folders.find(f => f.id === selectedFolderId)?.folder_name ?? 'Notes')
        : 'All Notes'

    return (
            <div style={{ flex: 1, background: '#FDFAF6', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                <div style={{ height: 52, padding: '0 22px', borderBottom: '1px solid #E8DDD0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1510', whiteSpace: 'nowrap' }}>{headerTitle}</span>
                    <input
                        placeholder="Search notes…"
                        style={{ flex: 1, maxWidth: 220, background: '#F2E8D6', border: '1px solid #E8DDD0', borderRadius: 7, padding: '6px 10px', fontFamily: 'inherit', fontSize: 12, color: '#6B5744', outline: 'none' }}
                    />
                    <button style={{ padding: '6px 13px', background: '#2D2318', color: '#E8D5B7', border: 'none', borderRadius: 7, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        + New Note
                    </button>
                </div>

                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A89070', fontSize: 13 }}>
                        Loading notes…
                    </div>
                ) : visibleNotes.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>📝</span>
                        <p style={{ fontSize: 13, color: '#A89070' }}>No notes yet. Create one to get started.</p>
                    </div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14, alignContent: 'start' }}>
                        {visibleNotes.map(note => {
                            const folder = folders.find(f => f.id === note.folder_id)
                            return (
                                <NoteCard
                                    key={note.id}
                                    title={getNoteTitle(note.notes_content)}
                                    preview={getNotePreview(note.notes_content)}
                                    folderName={folder?.folder_name}
                                    time={getRelativeTime(note.updated_at)}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
    )
}

function NoteCard({ title, preview, folderName, time }: { title: string; preview: string; folderName?: string; time: string }) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#fff',
                border: `1px solid ${hovered ? '#C8B89A' : '#E8DDD0'}`,
                borderRadius: 10,
                padding: 15,
                cursor: 'pointer',
                boxShadow: hovered ? '0 4px 18px rgba(45,35,24,0.09)' : 'none',
                transform: hovered ? 'translateY(-1px)' : 'none',
                transition: 'box-shadow 0.15s, transform 0.12s, border-color 0.15s',
            }}
        >
            {folderName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#8B5E3C', fontWeight: 500, marginBottom: 7, opacity: 0.85 }}>
                    📁 {folderName}
                </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1510', marginBottom: 6, lineHeight: 1.3 }}>
                {title}
            </div>
            <div style={{ fontSize: 12, color: '#A89070', lineHeight: 1.55, marginBottom: 11, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                {preview}
            </div>
            <div style={{ fontSize: 10, color: '#A89070' }}>
                {time}
            </div>
        </div>
    )
}
