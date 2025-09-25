import { useQuery } from '@tanstack/react-query';
import { getPoster, getPosterGroups, getPosterGroupDetail, getAllPosterTags, generatePosterCopy, getPosterJob } from '../../../services/posterService';
import type { PosterGroupListQuery } from '../../../services/dto/poster.request';

export const posterKeys = {
  all: ['poster'] as const,
  groups: () => [...posterKeys.all, 'groups'] as const,
  groupList: (params: PosterGroupListQuery) => [...posterKeys.groups(), params] as const,
  groupDetail: (groupId: number) => [...posterKeys.all, 'group-detail', groupId] as const,
  detail: (posterId: number) => [...posterKeys.all, 'detail', posterId] as const,
  tags: () => [...posterKeys.all, 'tags'] as const,
  copy: (posterId: number) => [...posterKeys.all, 'copy', posterId] as const,
  job: (jobId: string) => [...posterKeys.all, 'job', jobId] as const,
};

export function usePosterGroups(params: PosterGroupListQuery) {
  return useQuery({
    queryKey: posterKeys.groupList(params),
    queryFn: () => getPosterGroups(params),
    select: (res) => res.data,
  });
}

export function usePosterGroupDetail(groupId: number) {
  return useQuery({
    queryKey: posterKeys.groupDetail(groupId),
    queryFn: () => getPosterGroupDetail(groupId),
    select: (res) => res.data,
    enabled: !!groupId,
  });
}

export function usePosterDetail(posterId: number) {
  return useQuery({
    queryKey: posterKeys.detail(posterId),
    queryFn: () => getPoster(posterId),
    select: (res) => res.data,
    enabled: !!posterId,
  });
}

export function usePosterTags() {
  return useQuery({
    queryKey: posterKeys.tags(),
    queryFn: getAllPosterTags,
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePosterCopy(posterId: number) {
  return useQuery({
    queryKey: posterKeys.copy(posterId),
    queryFn: () => generatePosterCopy(posterId),
    select: (res) => res.data,
    enabled: !!posterId,
  });
}

export function usePosterJob(jobId: string, opts?: { enabled?: boolean; interval?: number }) {
  const enabled = opts?.enabled ?? true;
  const interval = opts?.interval ?? 2000;

  return useQuery({
    queryKey: posterKeys.job(jobId),
    queryFn: () => getPosterJob(jobId),
    select: (res) => res.data,
    enabled: !!jobId && enabled,
    refetchInterval: (q) => {
      const status = q.state.data?.data?.status;
      if (!status) return interval;
      const stopped = String(status).toUpperCase();
      return stopped === 'COMPLETED' || stopped === 'FAILED' ? false : interval;
    },
  });
}


