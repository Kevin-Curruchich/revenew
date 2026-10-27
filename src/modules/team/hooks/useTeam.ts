import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers } from "../actions/get-members";
import { createMember } from "../actions/create-member";
import { updateMember } from "../actions/update-member";
import { createPasswordLink } from "../actions/create-password-link";
import type { UpdateMemberRequest } from "../domain/team";
import { teamKeys } from "./query-keys";

export const useMembers = () =>
  useQuery({ queryKey: teamKeys.all, queryFn: getMembers });

// The two mutations below return a password link: `gcTime: 0` drops it from
// the mutation cache as soon as the dialog that shows it is gone.

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMember,
    gcTime: 0,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.all }),
  });
};

export const useCreatePasswordLink = () =>
  useMutation({ mutationFn: createPasswordLink, gcTime: 0 });

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberRequest }) =>
      updateMember(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.all }),
  });
};
