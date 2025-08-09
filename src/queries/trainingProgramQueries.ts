import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/BaseApiClient";
import {
  TrainingProgramCreateDto,
  TrainingProgramUpdateDto,
  TrainingProgramWeekCreateDto,
  TrainingProgramWeekUpdateDto,
  TrainingProgramWorkoutCreateDto,
  TrainingProgramWorkoutUpdateDto,
  TrainingProgramExerciseCreateDto,
  TrainingProgramExerciseUpdateDto,
} from "../api-client";

// Main Training Program queries
export const useGetAllPrograms = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await apiClient.trainingProgramAll();
      return response;
    },
  });

  return { data, error, isLoading };
};

export const useGetProgramById = (programId: number) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["program", programId],
    queryFn: async () => {
      const response = await apiClient.trainingProgramGET(programId);
      return response;
    },
    enabled: !!programId,
  });

  return { data, error, isLoading };
};

export const useCreateProgram = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["createProgram"],
    mutationFn: async (programData: TrainingProgramCreateDto) => {
      const response = await apiClient.trainingProgramPOST(programData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useUpdateProgram = (programId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateProgram", programId],
    mutationFn: async (programData: TrainingProgramUpdateDto) => {
      const response = await apiClient.trainingProgramPUT(
        programId,
        programData
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteProgram = (programId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteProgram", programId],
    mutationFn: async () => {
      const response = await apiClient.trainingProgramDELETE(programId);
      return response;
    },
  });

  return { mutate, error, isPending };
};

// Week management
export const useAddWeekToProgram = (programId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["addWeek", programId],
    mutationFn: async (weekData: TrainingProgramWeekCreateDto) => {
      const response = await apiClient.weeksPOST(programId, weekData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useUpdateWeek = (programId: number, weekId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateWeek", programId, weekId],
    mutationFn: async (weekData: TrainingProgramWeekUpdateDto) => {
      const response = await apiClient.weeksPUT(programId, weekId, weekData);
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteWeek = (programId: number, weekId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteWeek", programId, weekId],
    mutationFn: async () => {
      const response = await apiClient.weeksDELETE(programId, weekId);
      return response;
    },
  });

  return { mutate, error, isPending };
};

// Workout management
export const useAddWorkoutToWeek = (programId: number, weekId: number) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["addWorkoutToWeek", programId, weekId],
    mutationFn: async (workoutData: TrainingProgramWorkoutCreateDto) => {
      const response = await apiClient.workoutsPOST(
        programId,
        weekId,
        workoutData
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useUpdateProgramWorkout = (
  programId: number,
  weekId: number,
  workoutId: number
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateProgramWorkout", programId, weekId, workoutId],
    mutationFn: async (workoutData: TrainingProgramWorkoutUpdateDto) => {
      const response = await apiClient.workoutsPUT(
        programId,
        weekId,
        workoutId,
        workoutData
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteProgramWorkout = (
  programId: number,
  weekId: number,
  workoutId: number
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["deleteProgramWorkout", programId, weekId, workoutId],
    mutationFn: async () => {
      const response = await apiClient.workoutsDELETE(
        programId,
        weekId,
        workoutId
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};

// Exercise management
export const useAddExerciseToWorkout = (
  programId: number,
  weekId: number,
  workoutId: number
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["addExerciseToWorkout", programId, weekId, workoutId],
    mutationFn: async (exerciseData: TrainingProgramExerciseCreateDto) => {
      const response = await apiClient.exercisesPOST(
        programId,
        weekId,
        workoutId,
        exerciseData
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useUpdateProgramExercise = (
  programId: number,
  weekId: number,
  workoutId: number,
  exerciseId: number
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: [
      "updateProgramExercise",
      programId,
      weekId,
      workoutId,
      exerciseId,
    ],
    mutationFn: async (exerciseData: TrainingProgramExerciseUpdateDto) => {
      const response = await apiClient.exercisesPUT(
        programId,
        weekId,
        workoutId,
        exerciseId,
        exerciseData
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};

export const useDeleteProgramExercise = (
  programId: number,
  weekId: number,
  workoutId: number,
  exerciseId: number
) => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: [
      "deleteProgramExercise",
      programId,
      weekId,
      workoutId,
      exerciseId,
    ],
    mutationFn: async () => {
      const response = await apiClient.exercisesDELETE(
        programId,
        weekId,
        workoutId,
        exerciseId
      );
      return response;
    },
  });

  return { mutate, error, isPending };
};
