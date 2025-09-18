// import apiClient from "./apiClient";
// import type { ApiResponse } from "../types/api";
// import type { PosterGroupResponse, PosterGroupDetail } from "../types/poster";

// export async function getPosterGroups(): Promise<ApiResponse<PosterGroupResponse[]>> {
//   const { data } = await apiClient.get<ApiResponse<PosterGroupResponse[]>>("/api/posters/group");
//   return data;
// }

// export async function getPosterGroupDetail(groupId: number): Promise<ApiResponse<PosterGroupDetail>> {
//   // 스웨거가 path+query를 함께 요구하므로 둘 다 전송
//   const { data } = await apiClient.get<ApiResponse<PosterGroupDetail>>(
//     `/api/posters/group/${groupId}`,
//     { params: { groupId } }
//   );
//   return data;
// }


// // 수정 필요해요 ...