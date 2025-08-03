import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/BaseApiClient";
import { MuscleCreateDto } from "../api-client";

export const useGetAllMuscles = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["muscles"],
    queryFn: async () => {
      const response = await apiClient.muscleAll();
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useGetMuscleById = (muscleId: number) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["muscle", muscleId],
    queryFn: async () => {
      const response = await apiClient.muscleGET(muscleId);
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useUpdateMuscle = (
  muscleId: number,
  muscleData: MuscleCreateDto
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateMuscle", muscleId],
    mutationFn: async () => {
      const response = await apiClient.musclePUT(muscleId, muscleData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useCreateMuscle = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["createMuscle"],
    mutationFn: async (muscleData: MuscleCreateDto) => {
      const response = await apiClient.musclePOST(muscleData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteMuscle = (muscleId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteMuscle", muscleId],
    mutationFn: async () => {
      const response = await apiClient.muscleDELETE(muscleId);
      return response;
    },
  });

  return { mutate, error, isPending };
};
