import "@mantine/core/styles.css";
import {
  MantineProvider,
  AppShell,
  Burger,
  Group,
  Title,
  NavLink,
  Text,
  Stack,
  Badge,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import {
  IconHome,
  IconBarbell,
  IconUser,
  IconSettings,
  IconChartBar,
  IconTarget,
  IconLogout,
} from "@tabler/icons-react";
import { theme } from "./theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginScreen } from "./components/Login";
import { apiClient } from "./utils/BaseApiClient";

// Mock components for now - we'll replace these with real components later
const Dashboard = () => (
  <div>Dashboard - Overview of workouts, progress, etc.</div>
);
const Workouts = () => <div>Workouts - View and manage workouts</div>;
const Programs = () => (
  <div>Training Programs - Structured workout programs</div>
);
const Progress = () => <div>Progress - Charts and analytics</div>;
const Profile = () => <div>Profile - User settings and preferences</div>;

// Navigation items
const navigationItems = [
  { label: "Dashboard", icon: IconHome, component: Dashboard },
  { label: "Workouts", icon: IconBarbell, component: Workouts },
  { label: "Programs", icon: IconTarget, component: Programs },
  { label: "Progress", icon: IconChartBar, component: Progress },
  { label: "Profile", icon: IconUser, component: Profile },
];

// Main authenticated app shell
const AuthenticatedApp = () => {
  const [opened, { toggle }] = useDisclosure();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const { user, logout } = useAuth();

  // Find the active component
  const ActiveComponent =
    navigationItems.find((item) => item.label === activeSection)?.component ||
    Dashboard;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetching = async () => {
      const data = await apiClient.exerciseAll();
      console.log(data);
    };

    fetching();
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group gap="xs">
              <IconBarbell size={28} color="var(--mantine-color-blue-6)" />
              <Title order={3}>TrainerApp</Title>
            </Group>
          </Group>

          <Group>
            {import.meta.env.DEV && (
              <Badge variant="light" color="green">
                Development
              </Badge>
            )}
            <Text size="sm" c="dimmed">
              Welcome, {user?.name || user?.email || "User"}
            </Text>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconLogout size="1rem" />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text fw={500} size="sm" c="dimmed" mb="sm">
            NAVIGATION
          </Text>

          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              active={activeSection === item.label}
              label={item.label}
              leftSection={<item.icon size="1rem" />}
              onClick={() => setActiveSection(item.label)}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />
          ))}

          <Text fw={500} size="sm" c="dimmed" mt="xl" mb="sm">
            SETTINGS
          </Text>

          <NavLink
            label="Settings"
            leftSection={<IconSettings size="1rem" />}
            onClick={() => setActiveSection("Settings")}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <div style={{ padding: "1rem" }}>
          <Title order={2} mb="lg">
            {activeSection}
          </Title>
          <ActiveComponent />
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MantineProvider>
  );
}

// App content that depends on auth state
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Center>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />;
};
