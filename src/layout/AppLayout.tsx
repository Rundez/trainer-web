import "@mantine/core/styles.css";
import {
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
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../utils/BaseApiClient";
import { Outlet, useNavigate } from "react-router";
import { useIsMobile } from "../hooks/useIsMobile";

// Navigation items
const navigationItems = [
  { label: "Dashboard", icon: IconHome, url: "/" },
  { label: "Workouts", icon: IconBarbell, url: "/workouts" },
  { label: "Programs", icon: IconTarget, url: "/programs" },
  { label: "Progress", icon: IconChartBar, url: "/progress" },
  { label: "Profile", icon: IconUser, url: "/profile" },
];

export const AppLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const { user, logout } = useAuth();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  if (!isAuthenticated) {
    navigate("/login");
  }

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
            {import.meta.env.DEV && !isMobile && (
              <>
                <Badge variant="light" color="green">
                  Development
                </Badge>
                <Text size="sm" c="dimmed">
                  Welcome, {user?.name || user?.email || "User"}
                </Text>
              </>
            )}
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
              onClick={() => {
                setActiveSection(item.label);
                navigate(item.url);
              }}
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
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
