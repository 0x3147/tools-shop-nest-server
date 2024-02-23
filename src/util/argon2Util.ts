import * as argon2 from 'argon2'

const handleEncrypt = async (password: string) => {
  return await argon2.hash(password)
}

const handleDecrypt = async (hashPassword: string, password: string) => {
  return await argon2.verify(hashPassword, password)
}

export { handleDecrypt, handleEncrypt }
