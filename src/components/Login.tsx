// src/components/LoginScreen.tsx
import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  TextInput,
  Stack,
  Group,
  Center,
  Divider,
  Alert,
} from "@mantine/core";
import {
  IconBarbell,
  IconBrandGoogle,
  IconMail,
  IconLock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isDevelopment = import.meta.env.DEV;
  console.log(isDevelopment);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Container
      size="sm"
      style={{ height: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper p="xl" shadow="md" style={{ width: "100%" }}>
        <Center mb="xl">
          <Group gap="xs">
            <IconBarbell size={40} color="var(--mantine-color-blue-6)" />
            <Title order={1}>TrainerApp</Title>
          </Group>
        </Center>

        <Text ta="center" c="dimmed" mb="xl">
          Your personal fitness companion for tracking workouts, exercises, and
          progress.
        </Text>

        {/* Development Mode */}
        {isDevelopment && (
          <>
            <Button fullWidth size="lg" onClick={login} loading={isLoading}>
              Continue in Development Mode
            </Button>
            <Text ta="center" size="xs" c="dimmed" mt="md" mb="xl">
              Development mode - click to continue
            </Text>
            <Divider
              label="Or use Supabase Auth"
              labelPosition="center"
              mb="md"
            />
          </>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {message && (
          <Alert color="green" mb="md">
            {message}
          </Alert>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftSection={<IconMail size="1rem" />}
              required
            />

            <TextInput
              label="Password"
              placeholder="Your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftSection={<IconLock size="1rem" />}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!email || !password}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <Text ta="center" size="sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setIsSignUp(!isSignUp)}
                p={0}
                h="auto"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </Button>
            </Text>
          </Stack>
        </form>

        <Divider label="Or" labelPosition="center" my="md" />

        {/* OAuth Buttons */}
        <Button
          fullWidth
          variant="outline"
          leftSection={<IconBrandGoogle size="1rem" />}
          onClick={handleGoogleAuth}
          loading={loading}
        >
          Continue with Google
        </Button>
      </Paper>
    </Container>
  );
};
