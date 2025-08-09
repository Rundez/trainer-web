import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/BaseApiClient";
import { SetCreateDto } from "../api-client";

export const useGetAllSets = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["sets"],
    queryFn: async () => {
      const response = await apiClient.setAll();
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useGetSetById = (setId: number) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["set", setId],
    queryFn: async () => {
      const response = await apiClient.setGET(setId);
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useGetSetsByWorkoutId = (workoutId: number) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["sets", "workout", workoutId],
    queryFn: async () => {
      const response = await apiClient.byWorkoutId(workoutId);
      return response;
    },
    enabled: !!workoutId,
  });

  return { data, error, isLoading };
};

export const useCreateSet = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["createSet"],
    mutationFn: async (setData: SetCreateDto) => {
      const response = await apiClient.setPOST(setData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useUpdateSet = (setId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateSet", setId],
    mutationFn: async (setData: SetCreateDto) => {
      const response = await apiClient.setPUT(setId, setData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteSet = (setId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteSet", setId],
    mutationFn: async () => {
      const response = await apiClient.setDELETE(setId);
      return response;
    },
  });

  return { mutate, error, isPending };
};
