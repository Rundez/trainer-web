import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/BaseApiClient";
import { ExerciseCreateDto } from "../api-client";

export const useGetAllExercises = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const response = await apiClient.exerciseAll();
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useGetExerciseById = (exerciseId: number) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: async () => {
      const response = await apiClient.exerciseGET(exerciseId);
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useUpdateExercise = (
  exerciseId: number,
  exerciseData: ExerciseCreateDto
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateExercise", exerciseId],
    mutationFn: async () => {
      const response = await apiClient.exercisePUT(exerciseId, exerciseData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useCreateExercise = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["createExercise"],
    mutationFn: async (exerciseData: ExerciseCreateDto) => {
      const response = await apiClient.exercisePOST(exerciseData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteExercise = (exerciseId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteExercise", exerciseId],
    mutationFn: async () => {
      const response = await apiClient.exerciseDELETE(exerciseId);
      return response;
    },
  });

  return { mutate, error, isPending };
};
