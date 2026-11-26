import { projectIdString } from './projectContract.js';

export const projectApiBaseUrl = import.meta.env?.VITE_PROJECT_API_BASE_URL?.trim() ?? '';

const sessionKey = `apply-project-session:${projectApiBaseUrl}`;
const listeners = new Set();

function normalizeSession(value) {
  const userId = projectIdString(value?.userId);
  const accessToken = typeof value?.accessToken === 'string' ? value.accessToken.trim() : '';
  return accessToken && userId ? { accessToken, userId } : null;
}

function readSession() {
  try {
    return normalizeSession(JSON.parse(sessionStorage.getItem(sessionKey)));
  } catch {
    return null;
  }
}

let session = readSession();

export function getProjectSession() {
  return session;
}

export function subscribeProjectSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setProjectSession(value) {
  const next = normalizeSession(value);
  if (value != null && !next) throw new Error('로그인 응답에서 액세스 토큰과 사용자 ID를 확인할 수 없어요.');
  session = next;
  try {
    if (next) sessionStorage.setItem(sessionKey, JSON.stringify(next));
    else sessionStorage.removeItem(sessionKey);
  } catch {
    // Keep the current session in memory when browser storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}
