export const AUTH_STORAGE_KEY = 'sentinelai-auth';
export const AUTH_EXPIRED_EVENT = 'sentinelai:auth-expired';

export function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function notifyAuthExpired(message = '登录已过期，请重新登录。') {
  if (typeof window === 'undefined') {
    return;
  }

  clearStoredAuth();
  window.dispatchEvent(
    new CustomEvent(AUTH_EXPIRED_EVENT, {
      detail: { message },
    }),
  );
}
