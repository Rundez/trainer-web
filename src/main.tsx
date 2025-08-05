import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router";
import { AppLayout } from "./layout/AppLayout.tsx";
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { theme } from "./theme";
import { LoginScreen } from "./components/Login.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Workouts } from "./pages/Workouts.tsx";
import { Programs } from "./pages/Programs.tsx";
import { Progress } from "./pages/Progress.tsx";

const router = createBrowserRouter([
  {
    element: <AppLayout />, // Layout for all children
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/workouts", element: <Workouts /> },
      { path: "/programs", element: <Programs /> },
      { path: "/progress", element: <Progress /> },
      { path: "/profile", element: <Progress /> },

      // Add more protected routes here
    ],
  },
  { path: "/signup", element: <LoginScreen /> }, // No layout
  { path: "/login", element: <LoginScreen /> }, // No layout
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
