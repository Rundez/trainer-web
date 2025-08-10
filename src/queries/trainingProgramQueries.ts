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

// Dynamic variant for updating program
export const useUpdateProgram = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateProgramDynamic"],
    mutationFn: async (params: { id: number; data: TrainingProgramUpdateDto }) => {
      const { id, data } = params;
      const response = await apiClient.trainingProgramPUT(id, data);
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

export const useUpdateWeek = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateWeekDynamic"],
    mutationFn: async (params: { programId: number; weekId: number; data: TrainingProgramWeekUpdateDto }) => {
      const { programId, weekId, data } = params;
      const response = await apiClient.weeksPUT(programId, weekId, data);
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

export const useUpdateProgramWorkout = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateProgramWorkoutDynamic"],
    mutationFn: async (params: { programId: number; weekId: number; workoutId: number; data: TrainingProgramWorkoutUpdateDto }) => {
      const { programId, weekId, workoutId, data } = params;
      const response = await apiClient.workoutsPUT(programId, weekId, workoutId, data);
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

export const useUpdateProgramExercise = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["updateProgramExerciseDynamic"],
    mutationFn: async (params: { programId: number; weekId: number; workoutId: number; exerciseId: number; data: TrainingProgramExerciseUpdateDto }) => {
      const { programId, weekId, workoutId, exerciseId, data } = params;
      const response = await apiClient.exercisesPUT(programId, weekId, workoutId, exerciseId, data);
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
