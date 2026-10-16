import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signIn } from './signInServerAction';

const { mockHeadersGet, mockCookiesSet } = vi.hoisted(() => ({
    mockHeadersGet: vi.fn(),
    mockCookiesSet: vi.fn()
}))


vi.mock('next/headers', () => ({
    headers: vi.fn(() => Promise.resolve({ get: mockHeadersGet })),
    cookies: vi.fn(() => Promise.resolve({ set: mockCookiesSet }))
}))

vi.mock('bcrypt', () => ({
    default: { compare: vi.fn() }
}))


describe('Sign In', () => {
    describe('Invalid Data Testing', () => {
        it('No email should fail', async () => {
            const result = await signIn({ email: '', password: 'test' })
            expect(result.success).toBe(false)
        })
    })
})