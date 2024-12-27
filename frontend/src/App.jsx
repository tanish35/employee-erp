import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUser } from "./hooks/useUser";
const App = () => {
  const { loadingUser, userDetails } = useUser();
  const router = createBrowserRouter([
    {
      path: "/",
      element: !loadingUser && userDetails ? <Navigate to="/dashboard" replace /> : <LoginPage />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
  ]);

  return (
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
};

export default App;
