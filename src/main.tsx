import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router";
import { AppLayout } from "./layout/AppLayout.tsx";
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { theme } from "./theme";
import { LoginScreen } from "./components/Login.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";

const router = createBrowserRouter([
  {
    element: <AppLayout />, // Layout for all children
    children: [
      { path: "/", element: <Dashboard /> },
      // Add more protected routes here
    ],
  },
  { path: "/signup", element: <LoginScreen /> }, // No layout
  { path: "/login", element: <LoginScreen /> }, // No layout
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
