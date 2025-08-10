import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { IconPlus, IconTrash, IconCircleCheck } from "@tabler/icons-react";
import { useCreateWorkout, useUpdateWorkout } from "../queries/workoutQueries";
import { useGetAllExercises } from "../queries/exerciseQueries";
import { useCreateSet, useUpdateSet } from "../queries/setQueries";
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
  const [activeGroupExerciseId, setActiveGroupExerciseId] = useState<number | null>(null); // which exercise shows new-set row
  const [newSet, setNewSet] = useState<{ weight?: number; reps?: number; rpe?: number }>({});
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{ weight?: number; reps?: number; rpe?: number }>({});

  const queryClient = useQueryClient();
  const { mutate: createWorkout, isPending: isCreatingWorkout } =
    useCreateWorkout();
  const { mutate: createSet, isPending: isCreatingSet } = useCreateSet();
  const { mutate: updateSet, isPending: isUpdatingSet } = useUpdateSet();
  const { mutate: updateWorkout, isPending: isUpdatingWorkout } = useUpdateWorkout();

  // Local storage persistence for "current" workout draft
  const STORAGE_KEY = "currentWorkoutDraft";
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && groups.length === 0 && !workoutId) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.workoutName) {
          setWorkoutName(parsed.workoutName);
          setNotes(parsed.notes || "");
          setGroups(parsed.groups || []);
          setWorkoutId(parsed.workoutId || null);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({
      workoutId,
      workoutName,
      notes,
      groups,
      ts: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, payload);
  }, [workoutId, workoutName, notes, groups]);

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
      <LoadingOverlay visible={isExercisesLoading || isCreatingWorkout || isCreatingSet || isUpdatingSet || isUpdatingWorkout} />
      <Stack gap="md" pb={120}>
        <TextInput
          label="Workout name"
          value={workoutName}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setWorkoutName(val);
            if (workoutId) {
              const dto = new WorkoutCreateDto({
                name: val,
                description: undefined,
                notes: notes || undefined,
                setIds: [],
              });
              updateWorkout( {data: dto, id: workoutId}, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout", workoutId] }) });
            }
          }}
          placeholder="Enter workout name first"
          withAsterisk
        />
        <TextInput
          label="Notes"
          value={notes}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setNotes(val);
            if (workoutId) {
              const dto = new WorkoutCreateDto({
                name: workoutName,
                description: undefined,
                notes: val || undefined,
                setIds: [],
              });
              updateWorkout({data:dto, id:workoutId}, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout", workoutId] }) });
            }
          }}
          placeholder="Optional notes (editable anytime)"
        />

        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={() => setExerciseModalOpen(true)}
          disabled={workoutName.trim().length === 0}
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
                    color={activeGroupExerciseId === g.exerciseId ? "green" : "blue"}
                    onClick={() => openAddSet(g.exerciseId)}
                    aria-label="Add set"
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Stack gap={4}>
                {g.sets.map((s, idx) => {
                  const isEditing = editingSetId === s.id || editingSetId === `srv-${s.serverId}`;
                  return (
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
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (!isEditing) {
                          setEditingSetId(s.serverId ? `srv-${s.serverId}` : s.id);
                          setEditingValues({ weight: s.weight, reps: s.reps, rpe: s.rpe });
                        }
                      }}
                    >
                      <Text size="sm">Set {idx + 1}</Text>
                      {isEditing ? (
                        <Group gap={4} wrap="nowrap">
                          <NumberInput
                            value={editingValues.weight}
                            onChange={(v) => setEditingValues((ev) => ({ ...ev, weight: Number(v) }))}
                            placeholder="kg"
                            size="xs"
                            hideControls
                            style={{ width: 70 }}
                          />
                          <NumberInput
                            value={editingValues.reps}
                            onChange={(v) => setEditingValues((ev) => ({ ...ev, reps: Number(v) }))}
                            placeholder="reps"
                            size="xs"
                            hideControls
                            style={{ width: 70 }}
                          />
                          <NumberInput
                            value={editingValues.rpe}
                            onChange={(v) => setEditingValues((ev) => ({ ...ev, rpe: Number(v) }))}
                            placeholder="RPE"
                            size="xs"
                            hideControls
                            min={1}
                            max={10}
                            style={{ width: 70 }}
                          />
                          <Group gap={4}>
                            <Button
                              size="compact-xs"
                              variant="light"
                              disabled={!editingValues.weight || !editingValues.reps || !s.serverId}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!s.serverId || !workoutId) return;
                                updateSet(
                                  {
                                    id: s.serverId,
                                    data: new SetCreateDto({
                                      exerciseId: s.exerciseId,
                                      workoutId: workoutId,
                                      weight: editingValues.weight!,
                                      reps: editingValues.reps!,
                                      rpe: editingValues.rpe,
                                      notes: s.notes,
                                    }),
                                  },
                                  {
                                    onSuccess: () => {
                                      setGroups((prev) =>
                                        prev.map((gr) =>
                                          gr.exerciseId === g.exerciseId
                                            ? {
                                                ...gr,
                                                sets: gr.sets.map((st) =>
                                                  st.id === s.id
                                                    ? { ...st, ...editingValues }
                                                    : st
                                                ),
                                              }
                                            : gr
                                        )
                                      );
                                      setEditingSetId(null);
                                      queryClient.invalidateQueries({ queryKey: ["sets", "workout", workoutId] });
                                    },
                                  }
                                );
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              size="compact-xs"
                              variant="subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSetId(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </Group>
                        </Group>
                      ) : (
                        <Group gap={8} wrap="nowrap">
                          <Text size="sm" c="dimmed">
                            {s.weight ?? "-"} kg x {s.reps ?? "-"}
                          </Text>
                          {s.isPersisted && (
                            <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />
                          )}
                        </Group>
                      )}
                    </Flex>
                  );
                })}
                {g.sets.length === 0 && (
                  <Text size="xs" c="dimmed">
                    No sets yet.
                  </Text>
                )}
                {activeGroupExerciseId === g.exerciseId && (
                  <Flex
                    align="center"
                    gap={8}
                    style={{
                      border: "1px dashed var(--mantine-color-gray-4)",
                      borderRadius: rem(6),
                      padding: rem(6),
                    }}
                  >
                    <NumberInput
                      value={newSet.weight}
                      onChange={(v) => setNewSet((s) => ({ ...s, weight: Number(v) }))}
                      placeholder="kg"
                      size="xs"
                      hideControls
                      style={{ width: 70 }}
                    />
                    <NumberInput
                      value={newSet.reps}
                      onChange={(v) => setNewSet((s) => ({ ...s, reps: Number(v) }))}
                      placeholder="reps"
                      size="xs"
                      hideControls
                      style={{ width: 70 }}
                    />
                    <NumberInput
                      value={newSet.rpe}
                      onChange={(v) => setNewSet((s) => ({ ...s, rpe: Number(v) }))}
                      placeholder="RPE"
                      size="xs"
                      hideControls
                      min={1}
                      max={10}
                      style={{ width: 70 }}
                    />
                    <Button
                      size="compact-xs"
                      disabled={!newSet.weight || !newSet.reps || !workoutId}
                      leftSection={<IconPlus size={14} />}
                      onClick={() => persistSet(g.exerciseId)}
                    >
                      Add
                    </Button>
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      onClick={() => {
                        setActiveGroupExerciseId(null);
                        setNewSet({});
                      }}
                    >
                      Close
                    </Button>
                  </Flex>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
      {/* Floating panel removed; inline add/edit implemented */}

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
