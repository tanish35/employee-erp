import React, { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import Mainrouter from "./components/routes/mainroute";

const App = () => {
  return (
    <ChakraProvider>
      <RouterProvider router={Mainrouter} />
    </ChakraProvider>
  );
};

export default App;
