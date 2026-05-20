/**
 * Session Helper - Guest session management
 */

const SESSION_ID_KEY = 'x-session-id';

/**
 * Get the current guest session ID from localStorage or create a new one.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Generate a new UUID-like string if not present
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the guest session ID (usually after merge)
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_ID_KEY);
}
