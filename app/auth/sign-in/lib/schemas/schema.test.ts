import { describe, it, expect } from 'vitest'
import { SignInForm, JWTPayload } from './schema'

describe('SignInForm', () => {
    describe('valid inputs', () => {
        it('accepts a valid email and password', () => {
            const result = SignInForm.safeParse({ email: 'test@example.com', password: 'password123' })
            expect(result.success).toBe(true)
        })
    })

    describe('invalid inputs', () => {
        it('rejects a missing email field', () => {
            const result = SignInForm.safeParse({ password: 'password123' })
            expect(result.success).toBe(false)
        })

        it('rejects a missing password field', () => {
            const result = SignInForm.safeParse({ email: 'test@example.com' })
            expect(result.success).toBe(false)
        })

        it('rejects a non-string email', () => {
            const result = SignInForm.safeParse({ email: 42, password: 'password123' })
            expect(result.success).toBe(false)
        })

        it('rejects a non-string password', () => {
            const result = SignInForm.safeParse({ email: 'test@example.com', password: true })
            expect(result.success).toBe(false)
        })

        it('rejects an empty object', () => {
            const result = SignInForm.safeParse({})
            expect(result.success).toBe(false)
        })
    })
})

describe('JWTPayload', () => {
    describe('valid inputs', () => {
        it('accepts a valid sub and authenticated role', () => {
            const result = JWTPayload.safeParse({ sub: 'user-abc-123', role: 'authenticated' })
            expect(result.success).toBe(true)
        })
    })

    describe('invalid inputs', () => {
        it('rejects a missing sub field', () => {
            const result = JWTPayload.safeParse({ role: 'authenticated' })
            expect(result.success).toBe(false)
        })

        it('rejects a non-string sub', () => {
            const result = JWTPayload.safeParse({ sub: 99, role: 'authenticated' })
            expect(result.success).toBe(false)
        })

        it('rejects a missing role field', () => {
            const result = JWTPayload.safeParse({ sub: 'user-abc-123' })
            expect(result.success).toBe(false)
        })

        it('rejects a role other than authenticated', () => {
            const result = JWTPayload.safeParse({ sub: 'user-abc-123', role: 'admin' })
            expect(result.success).toBe(false)
        })

        it('rejects an empty object', () => {
            const result = JWTPayload.safeParse({})
            expect(result.success).toBe(false)
        })
    })
})
