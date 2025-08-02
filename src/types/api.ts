// src/types/api.ts

export interface ExerciseDto {
  id: number;
  name: string;
  description: string;
}

export interface ExerciseCreateDto {
  name: string;
  description: string;
  muscleIds: number[];
}

export interface MuscleDto {
  id: number;
  name: string;
  category: string;
  description: string;
}

export interface MuscleCreateDto {
  name: string;
  category: string;
  description: string;
  exerciseIds: number[];
}

export interface SetDto {
  id: number;
  weight: number;
  reps: number;
  rpe?: number;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  exercise: ExerciseDto;
  workoutId: number;
}

export interface SetCreateDto {
  exerciseId: number;
  workoutId: number;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
}

export interface WorkoutDto {
  id: number;
  name: string;
  description: string;
  isStarted: boolean;
  isCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  sets: SetDto[];
}

export interface WorkoutCreateDto {
  name: string;
  programId?: number;
  description: string;
  notes?: string;
  setIds: number[];
}

export interface TrainingProgramDto {
  id: number;
  name: string;
  description: string;
  weekCount: number;
  isTemplate: boolean;
  isPublic: boolean;
  weeks: TrainingProgramWeekDto[];
  completedWorkouts: WorkoutDto[];
}

export interface TrainingProgramCreateDto {
  name: string;
  description: string;
  weekCount: number;
  isTemplate: boolean;
  isPublic: boolean;
  parentProgramId?: number;
}

export interface TrainingProgramWeekDto {
  id: number;
  weekNumber: number;
  notes?: string;
  workouts: TrainingProgramWorkoutDto[];
}

export interface TrainingProgramWorkoutDto {
  id: number;
  dayOfWeek: number;
  name: string;
  exercises: TrainingProgramExerciseDto[];
}

export interface TrainingProgramExerciseDto {
  id: number;
  order: number;
  sets: number;
  reps: number;
  weight?: number;
  rpe?: number;
  notes?: string;
  exerciseId: number;
  exercise?: ExerciseDto;
}

export interface ProgramSummaryDto {
  id: number;
  name: string;
  description: string;
  weekCount: number;
  isTemplate: boolean;
  isPublic: boolean;
  completedWorkoutCount: number;
}
