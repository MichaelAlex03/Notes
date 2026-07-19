import bcrypt from "bcryptjs"

export const createHashedPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    return hash
}

export const generateCode = () => {
    
}


