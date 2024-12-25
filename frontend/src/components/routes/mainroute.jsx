import React from "react";
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../Login";
import Dashboard from "../Dashboard";

const Mainrouter = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

export default Mainrouter;
