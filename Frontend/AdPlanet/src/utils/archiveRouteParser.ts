export type ArchiveKind = "logo" | "poster";

export function parseKindFromPath(pathname: string): ArchiveKind | null {
  if (pathname.includes("/archive/logo")) return "logo";
  if (pathname.includes("/archive/poster")) return "poster";
  return null;
}

// SortTabs에서 쓰기 쉽게 fallback 포함
export function inferKind(pathname: string, fallback: ArchiveKind = "logo"): ArchiveKind {
  return parseKindFromPath(pathname) ?? fallback;
}

export function isTagsRoute(pathname: string) {
  return pathname.includes("/tags");
}

// 경로에서 csv만 뽑기
export function getPathTagCsv(pathname: string): string {
  return isTagsRoute(pathname) ? (pathname.split("/tags/")[1]?.split("/")[0] ?? "") : "";
}

export function csvToIds(csv?: string | null): number[] {
  if (!csv) return [];
  return [...new Set(csv.split(",").map(Number).filter(n => Number.isFinite(n) && n > 0))];
}

export function idsToCsv(ids?: number[]) {
  if (!ids || ids.length === 0) return undefined;
  return [...new Set(ids)].join(",");
}

/** /archive/{kind}/tags(/:csv) */
export function buildTagsPath(kind: ArchiveKind, ids?: number[]) {
  const csv = idsToCsv(ids);
  return csv ? `/archive/${kind}/tags/${csv}` : `/archive/${kind}/tags`;
}

/** 배열 토글 유틸 */
export function toggleId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
}
