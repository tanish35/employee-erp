import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../Login";
import Dashboard from "../Dashboard";
import ProtectedRoute from "../ProtectedRoute";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
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

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
