import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Stack,
  Group,
  Title,
  Text,
  Card,
  ActionIcon,
  NumberInput,
  Select,
  Badge,
  Divider,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconBarbell,
  IconInfoCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useGetAllExercises } from "../queries/exerciseQueries";
import { useCreateWorkout } from "../queries/workoutQueries";
import { useCreateSet } from "../queries/setQueries";
import {
  WorkoutCreateDto,
  SetCreateDto,
  ExerciseDto,
  IWorkoutCreateDto,
} from "../api-client";

interface WorkoutExercise {
  exerciseId: number;
  exercise?: ExerciseDto;
  sets: Array<{
    weight: number;
    reps: number;
    rpe?: number;
    notes?: string;
    tempId: string;
  }>;
}

interface QuickWorkoutEditorProps {
  opened: boolean;
  onClose: () => void;
  onWorkoutCreated?: (workoutId: number) => void;
}

export const QuickWorkoutEditor: React.FC<QuickWorkoutEditorProps> = ({
  opened,
  onClose,
  onWorkoutCreated,
}) => {
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [isCreating, setIsCreating] = useState(false);

  const { data: exercises, isLoading: exercisesLoading } = useGetAllExercises();
  const { mutate: createWorkout } = useCreateWorkout();
  const { mutate: createSet } = useCreateSet();

  const exerciseOptions =
    exercises?.map((ex) => ({
      value: ex.id?.toString() || "",
      label: ex.name || "",
    })) || [];

  const addExercise = () => {
    setWorkoutExercises((prev) => [
      ...prev,
      {
        exerciseId: 0,
        sets: [
          {
            weight: 0,
            reps: 0,
            rpe: undefined,
            notes: "",
            tempId: `set_${Date.now()}_${Math.random()}`,
          },
        ],
      },
    ]);
  };

  const removeExercise = (exerciseIndex: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
  };

  const updateExercise = (exerciseIndex: number, exerciseId: number) => {
    const selectedExercise = exercises?.find((ex) => ex.id === exerciseId);
    setWorkoutExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, exerciseId, exercise: selectedExercise }
          : ex
      )
    );
  };

  const addSet = (exerciseIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  weight: 0,
                  reps: 0,
                  rpe: undefined,
                  notes: "",
                  tempId: `set_${Date.now()}_${Math.random()}`,
                },
              ],
            }
          : ex
      )
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: any
  ) => {
    setWorkoutExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((set, si) =>
                si === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  };

  const resetForm = () => {
    setWorkoutName("");
    setWorkoutNotes("");
    setWorkoutExercises([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const createWorkoutAndSets = async () => {
    if (!workoutName.trim()) return;

    setIsCreating(true);
    try {
      // Create the workout first
      const workoutData: IWorkoutCreateDto = {
        name: workoutName,
        description: "Quick workout",
        notes: workoutNotes || undefined,
        setIds: [], // Empty initially
      };

      createWorkout(workoutData, {
        onSuccess: async (createdWorkout) => {
          // Create all sets for this workout
          const setPromises: Promise<void>[] = [];

          workoutExercises.forEach((exercise) => {
            if (exercise.exerciseId > 0) {
              exercise.sets.forEach((set) => {
                const setData: SetCreateDto = {
                  exerciseId: exercise.exerciseId,
                  workoutId: createdWorkout.id || 0,
                  weight: set.weight,
                  reps: set.reps,
                  rpe: set.rpe,
                  notes: set.notes || undefined,
                };

                const setPromise = new Promise<void>((resolve, reject) => {
                  createSet(setData, {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                  });
                });

                setPromises.push(setPromise);
              });
            }
          });

          // Wait for all sets to be created
          await Promise.all(setPromises);

          onWorkoutCreated?.(createdWorkout.id || 0);
          handleClose();
          setIsCreating(false);
        },
        onError: (error) => {
          console.error("Failed to create workout:", error);
          setIsCreating(false);
        },
      });
    } catch (error) {
      console.error("Error creating workout:", error);
      setIsCreating(false);
    }
  };

  const isValid =
    workoutName.trim() &&
    workoutExercises.length > 0 &&
    workoutExercises.every((ex) => ex.exerciseId > 0 && ex.sets.length > 0);

  if (exercisesLoading) {
    return (
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Quick Workout"
        size="lg"
      >
        <Center p="xl">
          <Stack align="center" gap="md">
            <Loader />
            <Text>Loading exercises...</Text>
          </Stack>
        </Center>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Quick Workout"
      size="xl"
    >
      <Stack gap="md">
        <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
          Create a standalone workout for logging exercises. This won't be part
          of any training program.
        </Alert>

        <TextInput
          label="Workout Name"
          placeholder="e.g., Push Day, Leg Day, Quick Session"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          required
        />

        <Textarea
          label="Notes (Optional)"
          placeholder="Any notes about this workout..."
          value={workoutNotes}
          onChange={(e) => setWorkoutNotes(e.target.value)}
          rows={2}
        />

        <Divider />

        <Group justify="space-between" align="center">
          <Title order={4}>Exercises</Title>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={addExercise}
            variant="light"
          >
            Add Exercise
          </Button>
        </Group>

        {workoutExercises.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No exercises added yet. Click "Add Exercise" to get started.
          </Text>
        ) : (
          <Stack gap="lg">
            {workoutExercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <Select
                      label="Exercise"
                      placeholder="Select an exercise"
                      data={exerciseOptions}
                      value={exercise.exerciseId?.toString() || ""}
                      onChange={(value) =>
                        updateExercise(exerciseIndex, parseInt(value || "0"))
                      }
                      searchable
                      required
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeExercise(exerciseIndex)}
                      mt="xl"
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Group>

                  {exercise.exercise && (
                    <Badge variant="light" color="blue">
                      {exercise.exercise.description}
                    </Badge>
                  )}

                  <Group justify="space-between" align="center">
                    <Text fw={500} size="sm">
                      Sets
                    </Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      leftSection={<IconPlus size="0.8rem" />}
                      onClick={() => addSet(exerciseIndex)}
                    >
                      Add Set
                    </Button>
                  </Group>

                  {exercise.sets.map((set, setIndex) => (
                    <Group key={set.tempId} align="flex-end" gap="xs">
                      <Text size="sm" c="dimmed" w={30}>
                        #{setIndex + 1}
                      </Text>
                      <NumberInput
                        label="Weight"
                        placeholder="kg"
                        value={set.weight}
                        onChange={(value) =>
                          updateSet(
                            exerciseIndex,
                            setIndex,
                            "weight",
                            value || 0
                          )
                        }
                        min={0}
                        step={0.5}
                        w={80}
                      />
                      <NumberInput
                        label="Reps"
                        placeholder="reps"
                        value={set.reps}
                        onChange={(value) =>
                          updateSet(exerciseIndex, setIndex, "reps", value || 0)
                        }
                        min={0}
                        w={70}
                      />
                      <NumberInput
                        label="RPE"
                        placeholder="1-10"
                        value={set.rpe || ""}
                        onChange={(value) =>
                          updateSet(exerciseIndex, setIndex, "rpe", value)
                        }
                        min={1}
                        max={10}
                        w={70}
                      />
                      <TextInput
                        label="Notes"
                        placeholder="Optional"
                        value={set.notes}
                        onChange={(e) =>
                          updateSet(
                            exerciseIndex,
                            setIndex,
                            "notes",
                            e.target.value
                          )
                        }
                        style={{ flex: 1 }}
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        disabled={exercise.sets.length === 1}
                      >
                        <IconX size="1rem" />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        <Divider />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftSection={<IconCheck size="1rem" />}
            onClick={createWorkoutAndSets}
            disabled={!isValid}
            loading={isCreating}
          >
            Create Workout
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
