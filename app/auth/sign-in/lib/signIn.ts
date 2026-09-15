import { SignJWT, jwtVerify, errors } from "jose"
import { JWT } from "./schemas/schema"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)


export async function createJWT(payload: JWT) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('5m')
		.sign(JWT_SECRET)

}

// Using same payload as JWT Token
export async function createRefreshToken(payload: JWT) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(REFRESH_SECRET)

}

export async function verifyAccessToken(token: string) {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET)
		return { payload, expired: false}
	} catch (e) {
		if (e instanceof errors.JWTExpired) {
			return { payload: null, expired: true }
		}
		return { payload: null, expired: false }

	}
}


export async function verifyRefreshToken(token: string) {
	try {
		const { payload } = await jwtVerify(token, REFRESH_SECRET)
		return payload
	} catch {
		return null

	}
}
