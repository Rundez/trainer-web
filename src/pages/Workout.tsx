import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Affix,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  // ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  // Title,
  rem,
} from "@mantine/core";
import { IconPlus, IconTrash, IconCircleCheck } from "@tabler/icons-react";
import { useCreateWorkout } from "../queries/workoutQueries";
import { useGetAllExercises } from "../queries/exerciseQueries";
import { useCreateSet } from "../queries/setQueries";
import { SetCreateDto, WorkoutCreateDto } from "../api-client";
import { useQueryClient } from "@tanstack/react-query";
// Simple local id generator (avoid extra dependency for now)
const genId = () => Math.random().toString(36).slice(2);

interface TempSetDraft {
  id: string; // local id
  exerciseId: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  isPersisted?: boolean; // after saving to API
  serverId?: number; // real id after save
}

interface TempExerciseGroup {
  exerciseId: number;
  name: string;
  sets: TempSetDraft[];
}

export const Workout = () => {
  // Local state for orphan workout before persisting
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [workoutName, setWorkoutName] = useState("Quick workout");
  const [notes, setNotes] = useState("");

  const { data: exercises, isLoading: isExercisesLoading } =
    useGetAllExercises();
  const exerciseOptions = useMemo(
    () =>
      (exercises || [])
        .filter((e) => !!e.name)
        .map((e) => ({ value: String(e.id), label: e.name as string })),
    [exercises]
  );

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );
  const [groups, setGroups] = useState<TempExerciseGroup[]>([]);
  const [activeGroupExerciseId, setActiveGroupExerciseId] = useState<
    number | null
  >(null);
  const [newSet, setNewSet] = useState<{
    weight?: number;
    reps?: number;
    rpe?: number;
  }>({});

  const queryClient = useQueryClient();
  const { mutate: createWorkout, isPending: isCreatingWorkout } =
    useCreateWorkout();
  const { mutate: createSet, isPending: isCreatingSet } = useCreateSet();

  // Ensure workout is created once user adds first exercise
  useEffect(() => {
    if (!workoutId && groups.length > 0) {
      const dto = new WorkoutCreateDto({
        name: workoutName,
        description: undefined,
        notes: notes || undefined,
        setIds: [],
      });
      createWorkout(dto, {
        onSuccess: (w) => {
          setWorkoutId(w.id!);
          queryClient.invalidateQueries({ queryKey: ["workouts"] });
        },
      });
    }
  }, [
    groups.length,
    workoutId,
    workoutName,
    notes,
    createWorkout,
    queryClient,
  ]);

  const addExerciseToWorkout = () => {
    if (!selectedExerciseId) return;
    const idNum = Number(selectedExerciseId);
    if (groups.find((g) => g.exerciseId === idNum)) {
      setExerciseModalOpen(false);
      setSelectedExerciseId(null);
      return;
    }
    const exercise = exercises?.find((e) => e.id === idNum);
    if (!exercise) return;
    setGroups((g) => [
      ...g,
      { exerciseId: idNum, name: exercise.name || "(Unnamed)", sets: [] },
    ]);
    setActiveGroupExerciseId(idNum);
    setExerciseModalOpen(false);
    setSelectedExerciseId(null);
  };

  const openAddSet = (exerciseId: number) => {
    setActiveGroupExerciseId(exerciseId);
  };

  const persistSet = (exerciseId: number) => {
    if (!workoutId) return; // workout creating
    if (!newSet.reps || !newSet.weight) return;
    const draft: TempSetDraft = {
      id: genId(),
      exerciseId,
      weight: newSet.weight,
      reps: newSet.reps,
      rpe: newSet.rpe,
      isPersisted: false,
    };
    // optimistic update
    setGroups((prev) =>
      prev.map((g) =>
        g.exerciseId === exerciseId ? { ...g, sets: [...g.sets, draft] } : g
      )
    );

    const dto = new SetCreateDto({
      exerciseId,
      workoutId: workoutId!,
      weight: newSet.weight!,
      reps: newSet.reps!,
      rpe: newSet.rpe,
      notes: undefined,
    });
    createSet(dto, {
      onSuccess: (s) => {
        setGroups((prev) =>
          prev.map((g) =>
            g.exerciseId === exerciseId
              ? {
                  ...g,
                  sets: g.sets.map((st) =>
                    st.id === draft.id
                      ? { ...st, isPersisted: true, serverId: s.id }
                      : st
                  ),
                }
              : g
          )
        );
        queryClient.invalidateQueries({
          queryKey: ["sets", "workout", workoutId],
        });
      },
    });
    setNewSet({});
  };

  const deleteLocalExercise = (exerciseId: number) => {
    setGroups((prev) => prev.filter((g) => g.exerciseId !== exerciseId));
    if (activeGroupExerciseId === exerciseId) setActiveGroupExerciseId(null);
  };

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isExercisesLoading || isCreatingWorkout || isCreatingSet}
      />
      <Stack gap="md" pb={120}>
        <TextInput
          label="Workout name"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.currentTarget.value)}
          placeholder="Name this workout"
        />
        <TextInput
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          placeholder="Optional notes"
        />

        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={() => setExerciseModalOpen(true)}
        >
          Add exercise
        </Button>

        {groups.length === 0 && (
          <Card withBorder>
            <Text size="sm" c="dimmed">
              No exercises yet. Tap "Add exercise" to start this quick workout.
            </Text>
          </Card>
        )}

        <Stack gap="sm">
          {groups.map((g) => (
            <Card key={g.exerciseId} withBorder p="sm" radius="md">
              <Group justify="space-between" align="flex-start" mb="xs">
                <Stack gap={2}>
                  <Text fw={600}>{g.name}</Text>
                  <Group gap={4}>
                    <Badge size="xs" color="blue" variant="light">
                      {g.sets.length} sets
                    </Badge>
                  </Group>
                </Stack>
                <Group gap="xs">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => deleteLocalExercise(g.exerciseId)}
                    aria-label="Remove exercise"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color={
                      activeGroupExerciseId === g.exerciseId ? "green" : "blue"
                    }
                    onClick={() => openAddSet(g.exerciseId)}
                    aria-label="Add set"
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              <Divider mb="xs" />
              <Stack gap={4}>
                {g.sets.map((s, idx) => (
                  <Flex
                    key={s.id}
                    align="center"
                    justify="space-between"
                    style={{
                      border: "1px solid var(--mantine-color-gray-3)",
                      borderRadius: rem(6),
                      padding: rem(6),
                      background: s.isPersisted
                        ? "var(--mantine-color-green-0)"
                        : "var(--mantine-color-yellow-0)",
                    }}
                  >
                    <Text size="sm">Set {idx + 1}</Text>
                    <Group gap={8} wrap="nowrap">
                      <Text size="sm" c="dimmed">
                        {s.weight ?? "-"} kg x {s.reps ?? "-"}
                      </Text>
                      {s.isPersisted && (
                        <IconCircleCheck
                          size={16}
                          color="var(--mantine-color-green-6)"
                        />
                      )}
                    </Group>
                  </Flex>
                ))}
                {g.sets.length === 0 && (
                  <Text size="xs" c="dimmed">
                    No sets yet.
                  </Text>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>

      {/* Floating add set panel */}
      {activeGroupExerciseId && (
        <Affix position={{ bottom: 16, left: 0, right: 0 }} w="100%">
          <Card
            withBorder
            radius="lg"
            shadow="sm"
            style={{
              margin: "0 auto",
              maxWidth: 480,
              background: "var(--mantine-color-body)",
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Add set
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => setActiveGroupExerciseId(null)}
                >
                  Close
                </Button>
              </Group>
              <Group gap="xs" grow wrap="nowrap">
                <NumberInput
                  label="Weight"
                  placeholder="kg"
                  value={newSet.weight}
                  onChange={(v) =>
                    setNewSet((s) => ({ ...s, weight: Number(v) }))
                  }
                  min={0}
                  hideControls
                />
                <NumberInput
                  label="Reps"
                  placeholder="reps"
                  value={newSet.reps}
                  onChange={(v) =>
                    setNewSet((s) => ({ ...s, reps: Number(v) }))
                  }
                  min={1}
                  hideControls
                />
                <NumberInput
                  label="RPE"
                  placeholder="rpe"
                  value={newSet.rpe}
                  onChange={(v) => setNewSet((s) => ({ ...s, rpe: Number(v) }))}
                  min={1}
                  max={10}
                  hideControls
                />
              </Group>
              <Button
                disabled={!newSet.weight || !newSet.reps || !workoutId}
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  activeGroupExerciseId && persistSet(activeGroupExerciseId)
                }
              >
                Save set
              </Button>
            </Stack>
          </Card>
        </Affix>
      )}

      <Modal
        opened={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        title="Add exercise"
        size="sm"
        centered
      >
        <Stack>
          <Select
            data={exerciseOptions}
            searchable
            placeholder="Select exercise"
            nothingFoundMessage={
              isExercisesLoading ? "Loading..." : "No exercises found"
            }
            value={selectedExerciseId}
            onChange={(v) => setSelectedExerciseId(v)}
          />
          <Button onClick={addExerciseToWorkout} disabled={!selectedExerciseId}>
            Add
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
};
