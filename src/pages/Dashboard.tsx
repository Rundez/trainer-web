import {
  Stack,
  Text,
  Card,
  Group,
  Title,
  Badge,
  Button,
  Grid,
  SimpleGrid,
} from "@mantine/core";
import {
  IconBarbell,
  IconTrendingUp,
  IconTarget,
  IconClock,
} from "@tabler/icons-react";
import { useGetAllPrograms } from "../queries/trainingProgramQueries";
import { useGetAllWorkouts } from "../queries/workoutQueries";

export const Dashboard = () => {
  const { data: workouts, isLoading: workoutsLoading } = useGetAllWorkouts();
  const { data: programs, isLoading: programsLoading } = useGetAllPrograms();

  const recentWorkouts = workouts?.slice(0, 3) || [];
  const activePrograms = programs?.filter((p) => !p.isTemplate) || [];

  return (
    <>
      <Stack gap="xl">
        {/* Quick Stats */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Workouts
                </Text>
                <Text fw={700} size="xl">
                  {workoutsLoading ? "..." : workouts?.length || 0}
                </Text>
              </div>
              <IconBarbell size="1.4rem" color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Active Programs
                </Text>
                <Text fw={700} size="xl">
                  {programsLoading ? "..." : activePrograms.length}
                </Text>
              </div>
              <IconTarget size="1.4rem" color="var(--mantine-color-green-6)" />
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  This Week
                </Text>
                <Text fw={700} size="xl">
                  {workouts?.filter((w) => w.isCompleted).length || 0}
                </Text>
              </div>
              <IconTrendingUp
                size="1.4rem"
                color="var(--mantine-color-orange-6)"
              />
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  In Progress
                </Text>
                <Text fw={700} size="xl">
                  {workouts?.filter((w) => w.isStarted && !w.isCompleted)
                    .length || 0}
                </Text>
              </div>
              <IconClock size="1.4rem" color="var(--mantine-color-red-6)" />
            </Group>
          </Card>
        </SimpleGrid>

        <Grid>
          {/* Recent Workouts */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder h="100%">
              <Card.Section p="md" pb="xs">
                <Group justify="space-between">
                  <Title order={4}>Recent Workouts</Title>
                  <Button variant="subtle" size="xs">
                    View All
                  </Button>
                </Group>
              </Card.Section>
              <Card.Section p="md" pt="xs">
                {workoutsLoading ? (
                  <Text c="dimmed">Loading...</Text>
                ) : recentWorkouts.length > 0 ? (
                  <Stack gap="sm">
                    {recentWorkouts.map((workout) => (
                      <Group
                        key={workout.id}
                        justify="space-between"
                        p="xs"
                        style={{
                          borderRadius: "var(--mantine-radius-sm)",
                          backgroundColor: "var(--mantine-color-gray-0)",
                        }}
                      >
                        <div>
                          <Text fw={500}>{workout.name}</Text>
                          <Text size="sm" c="dimmed">
                            {workout.sets?.length || 0} exercises
                          </Text>
                        </div>
                        <Stack gap={2} align="flex-end">
                          <Badge
                            color={
                              workout.isCompleted
                                ? "green"
                                : workout.isStarted
                                ? "orange"
                                : "gray"
                            }
                            variant="light"
                            size="sm"
                          >
                            {workout.isCompleted
                              ? "Completed"
                              : workout.isStarted
                              ? "In Progress"
                              : "Planned"}
                          </Badge>
                          {workout.completedAt && (
                            <Text size="xs" c="dimmed">
                              {new Date(
                                workout.completedAt
                              ).toLocaleDateString()}
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Stack align="center" gap="sm" py="xl">
                    <IconBarbell
                      size="2rem"
                      color="var(--mantine-color-gray-4)"
                    />
                    <Text c="dimmed" ta="center">
                      No workouts yet. Create your first workout!
                    </Text>
                    <Button variant="light" size="sm">
                      Create Workout
                    </Button>
                  </Stack>
                )}
              </Card.Section>
            </Card>
          </Grid.Col>

          {/* Active Programs */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder h="100%">
              <Card.Section p="md" pb="xs">
                <Group justify="space-between">
                  <Title order={4}>Active Programs</Title>
                  <Button variant="subtle" size="xs">
                    View All
                  </Button>
                </Group>
              </Card.Section>
              <Card.Section p="md" pt="xs">
                {programsLoading ? (
                  <Text c="dimmed">Loading...</Text>
                ) : activePrograms.length > 0 ? (
                  <Stack gap="sm">
                    {activePrograms.map((program) => (
                      <Group
                        key={program.id}
                        justify="space-between"
                        p="xs"
                        style={{
                          borderRadius: "var(--mantine-radius-sm)",
                          backgroundColor: "var(--mantine-color-gray-0)",
                        }}
                      >
                        <div>
                          <Text fw={500}>{program.name}</Text>
                          <Text size="sm" c="dimmed">
                            {program.weekCount} weeks •{" "}
                            {program.completedWorkoutCount} completed
                          </Text>
                        </div>
                        <Stack gap={2} align="flex-end">
                          <Badge color="blue" variant="light" size="sm">
                            Active
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {(program?.completedWorkoutCount ?? 0) > 0 &&
                            (program?.weekCount ?? 0) > 0
                              ? Math.round(
                                  ((program.completedWorkoutCount ?? 0) /
                                    ((program.weekCount ?? 0) * 3)) *
                                    100
                                )
                              : null}
                            % done
                          </Text>
                        </Stack>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Stack align="center" gap="sm" py="xl">
                    <IconTarget
                      size="2rem"
                      color="var(--mantine-color-gray-4)"
                    />
                    <Text c="dimmed" ta="center">
                      No active programs. Start a training program!
                    </Text>
                    <Button variant="light" size="sm">
                      Browse Programs
                    </Button>
                  </Stack>
                )}
              </Card.Section>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Card withBorder>
          <Title order={4} mb="md">
            Quick Actions
          </Title>
          <Group>
            <Button leftSection={<IconBarbell size="1rem" />} variant="light">
              Start Workout
            </Button>
            <Button leftSection={<IconTarget size="1rem" />} variant="light">
              Create Program
            </Button>
            <Button
              leftSection={<IconTrendingUp size="1rem" />}
              variant="light"
            >
              View Progress
            </Button>
          </Group>
        </Card>
      </Stack>
    </>
  );
};
