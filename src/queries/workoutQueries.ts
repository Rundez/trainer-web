import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/BaseApiClient";
import { WorkoutCreateDto } from "../api-client";

export const useGetAllWorkouts = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const response = await apiClient.workoutAll();
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useGetWorkoutById = (workoutId: number) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const response = await apiClient.workoutGET(workoutId);
      return response;
    },
    enabled: !!workoutId,
  });

  return { data, error, isLoading };
};

export const useGetWorkoutsByIds = (workoutIds: number[]) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["workouts", "ids", workoutIds],
    queryFn: async () => {
      const response = await apiClient.workoutsByIds(workoutIds);
      return response;
    },
    enabled: workoutIds.length > 0,
  });

  return { data, error, isLoading };
};

export const useCreateWorkout = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["createWorkout"],
    mutationFn: async (workoutData: WorkoutCreateDto) => {
      const response = await apiClient.workoutPOST(workoutData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useUpdateWorkout = (workoutId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateWorkout", workoutId],
    mutationFn: async (workoutData: WorkoutCreateDto) => {
      const response = await apiClient.workoutPUT(workoutId, workoutData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteWorkout = (workoutId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteWorkout", workoutId],
    mutationFn: async () => {
      const response = await apiClient.workoutDELETE(workoutId);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useStartWorkout = (workoutId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["startWorkout", workoutId],
    mutationFn: async () => {
      const response = await apiClient.start(workoutId);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useCompleteWorkout = (workoutId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["completeWorkout", workoutId],
    mutationFn: async () => {
      const response = await apiClient.complete(workoutId);
      return response;
    },
  });

  return { mutate, error, isPending };
};
