import { SignJWT, jwtVerify } from "jose"
import { JWT } from "./schemas/schema"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRETT)


export async function createJWT(payload: JWT){
	return await new SignJWT(payload)
	 	.setProtectedHeader({ alg: 'HS256'})
		.setIssuedAt()
		.setExpirationTime('5m')
		.sign(JWT_SECRET)
	
}

// Using same payload as JWT Token
export async function createRefreshToken (payload: JWT){
	return await new SignJWT(payload)
	 	.setProtectedHeader({ alg: 'HS256'})
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(REFRESH_SECRET)
	
}

// export async function verifyJWT(token: string){
// 	try{
// 		const { payload } = await verifyJWT(token, SECRET)
// 		return payload
// 	} catch {
// 		return null

// 	}
// }
