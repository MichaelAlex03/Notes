import { describe, it, expect } from 'vitest'
import { createHashedPassword, generateCode } from './signUp'


describe('createHashedPassword', () => {
    it('returns a string', async () => {
        const hashedPassword = await createHashedPassword('test')
        expect(typeof hashedPassword).toBe('string')
    })
})


describe('generateCode', () => {
    it('return a number', () => {
        const code = generateCode()
        expect(typeof code).toBe('number')
    })

    it('returns a 6 digit number between 100000(inclusive) - 1000000(exclusive)', () => {
        const code = generateCode()
        expect(code).toBeGreaterThanOrEqual(100000)
        expect(code).toBeLessThan(1000000)
    })
})