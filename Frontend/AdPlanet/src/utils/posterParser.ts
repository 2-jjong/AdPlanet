import apiClient from "../services/apiClient";


/** 절대 URL로 변환 (이미 절대면 그대로, 빈값이면 빈값, 상대면 baseURL 기준으로 절대) */
export const toAbsolute = (p: string) => {
  if (!p || /^https?:\/\//i.test(p)) return p;
  const base = (apiClient as any)?.defaults?.baseURL || "";
  return base ? new URL(p.startsWith("/") ? p : `/${p}`, base).toString() : p;
};