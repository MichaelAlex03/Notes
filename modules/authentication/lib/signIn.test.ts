import { describe, it, expect } from 'vitest'
import { createJWT, createRefreshToken, verifyAccessToken, verifyRefreshToken } from './signIn'

const payload = { id: 'user-123' }

describe('createJWT', () => {
    it('returns a string', async () => {
        const token = await createJWT(payload)
        expect(typeof token).toBe('string')
    })

    it('produces a 3-part JWT (header.payload.signature)', async () => {
        const token = await createJWT(payload)
        expect(token.split('.').length).toBe(3)
    })
})

describe('createRefreshToken', () => {
    it('returns a string', async () => {
        const token = await createRefreshToken(payload)
        expect(typeof token).toBe('string')
    })

    it('produces a 3-part JWT (header.payload.signature)', async () => {
        const token = await createRefreshToken(payload)
        expect(token.split('.').length).toBe(3)
    })
})

describe('verifyAccessToken', () => {
    it('returns the payload for a valid access token', async () => {
        const token = await createJWT(payload)
        const result = await verifyAccessToken(token)
        expect(result).not.toBeNull()
        expect(result?.id).toBe('user-123')
    })

    it('returns null for a garbage token string', async () => {
        const result = await verifyAccessToken('not.a.jwt')
        expect(result).toBeNull()
    })

    it('returns null for a tampered token', async () => {
        const token = await createJWT(payload)
        const tampered = token.slice(0, -5) + 'ZZZZZ'
        const result = await verifyAccessToken(tampered)
        expect(result).toBeNull()
    })

    it('returns null for a refresh token (signed with different secret)', async () => {
        const refreshToken = await createRefreshToken(payload)
        const result = await verifyAccessToken(refreshToken)
        expect(result).toBeNull()
    })
})

describe('verifyRefreshToken', () => {
    it('returns null for a garbage token string', async () => {
        const result = await verifyRefreshToken('not.a.jwt')
        expect(result).toBeNull()
    })

    it('returns null for a tampered token', async () => {
        const token = await createRefreshToken(payload)
        const tampered = token.slice(0, -5) + 'ZZZZZ'
        const result = await verifyRefreshToken(tampered)
        expect(result).toBeNull()
    })

    it('returns the payload for a valid refresh token', async () => {
        const token = await createRefreshToken(payload)
        const result = await verifyRefreshToken(token)
        expect(result).not.toBeNull()
        expect(result?.id).toBe('user-123')
    })
})
