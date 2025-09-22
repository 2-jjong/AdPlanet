export type ArchiveKind = "logo" | "poster";

/** 배열 토글 유틸 */
export function toggleId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
}
