const MAGIC_WORD = process.env.NEXT_PUBLIC_MAGIC_WORD || 'redwood'
const STEF_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_STEF_ADMIN_PASSWORD || 'puddle'
export const STEF_ADMIN_NAME = 'Stef'

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('redwood_userName')
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('redwood_userName')
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('redwood_userName', name)
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('redwood_userName')
}

/** Guest magic word (for everyone except Stef). */
export function verifyMagicWord(word: string): boolean {
  return word.toLowerCase().trim() === MAGIC_WORD.toLowerCase()
}

/** Stef's admin-only password. */
export function verifyStefPassword(word: string): boolean {
  return word.trim() === STEF_ADMIN_PASSWORD
}

/** Returns true if the given word is correct for the selected user (Stef = admin password, others = magic word). */
export function verifyLogin(word: string, selectedName: string): boolean {
  if (selectedName === STEF_ADMIN_NAME) {
    return verifyStefPassword(word)
  }
  return verifyMagicWord(word)
}

