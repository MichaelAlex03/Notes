import bcrypt from "bcryptjs"
import { randomInt } from "crypto"

export const createHashedPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    return hash
}

export const generateCode = () => {
    return randomInt(100000, 1000000)
}


