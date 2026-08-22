import { describe, it, expect } from 'vitest'
import { SignUpForm } from './schema'


describe('SignUp schema validation', () => {
    it('Valid data succesfully passes', () => {
        const body =
        {
            first_name: 'test',
            last_name: 'test',
            user_email: 'test@gmail.com',
            password: 'testings'
        }
        const result = SignUpForm.safeParse(body)
        expect(result.success).toBe(true)
    })

    it('First name is required', () => {
        const body =
        {
            first_name: null,
            last_name: 'test',
            user_email: 'test@gmail.com',
            password: 'test'
        }
        const result = SignUpForm.safeParse(body)
        expect(result.success).toBe(false)
    })

    it('Last name is required', () => {
        const body =
        {
            first_name: 'test',
            last_name: null,
            user_email: 'test@gmail.com',
            password: 'test'
        }
        const result = SignUpForm.safeParse(body)
        expect(result.success).toBe(false)
    })

    it('Email is required', () => {
        const body =
        {
            first_name: 'test',
            last_name: 'test',
            user_email: null,
            password: 'test'
        }
        const result = SignUpForm.safeParse(body)
        expect(result.success).toBe(false)
    })

    it('Password is required', () => {
        const body =
        {
            first_name: 'test',
            last_name: 'test',
            user_email: 'test@gmail.com',
            password: null
        }
        const result = SignUpForm.safeParse(body)
        expect(result.success).toBe(false)
    })

    it('first_name must be a string', () => {
        const result = SignUpForm.safeParse({ first_name: 123, last_name: 'test', user_email: 'test@gmail.com', password: 'testings' })
        expect(result.success).toBe(false)
    })

    it('last_name must be a string', () => {
        const result = SignUpForm.safeParse({ first_name: 'test', last_name: true, user_email: 'test@gmail.com', password: 'testings' })
        expect(result.success).toBe(false)
    })

    it('user_email must be a string', () => {
        const result = SignUpForm.safeParse({ first_name: 'test', last_name: 'test', user_email: 42, password: 'testings' })
        expect(result.success).toBe(false)
    })

    it('password must be a string', () => {
        const result = SignUpForm.safeParse({ first_name: 'test', last_name: 'test', user_email: 'test@gmail.com', password: 12345678 })
        expect(result.success).toBe(false)
    })

    it('Invalid email format fails', () => {
        const result = SignUpForm.safeParse({ first_name: 'test', last_name: 'test', user_email: 'not-an-email', password: 'testings' })
        expect(result.success).toBe(false)
    })

    it('Password shorter than 8 characters fails', () => {
        const result = SignUpForm.safeParse({ first_name: 'test', last_name: 'test', user_email: 'test@gmail.com', password: 'short' })
        expect(result.success).toBe(false)
    })

    it('Password of exactly 8 characters passes', () => {
        const result = SignUpForm.safeParse({ first_name: 'test', last_name: 'test', user_email: 'test@gmail.com', password: 'exactly8' })
        expect(result.success).toBe(true)
    })
})
