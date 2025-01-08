import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/Login";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import { useUser } from "./hooks/useUser";

const App = () => {
  const { loadingUser, userDetails } = useUser();

  const router = createBrowserRouter([
    {
      path: "/",
      element:
        !loadingUser && userDetails ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <LoginPage />
        ),
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "history",
          element: <History />,
        },
      ],
    },
  ]);

  return (
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
};

export default App;
