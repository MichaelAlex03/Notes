import { cookies } from "next/headers"

export const extractJwt = async () => {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('access_token')?.value

    return jwtToken
}