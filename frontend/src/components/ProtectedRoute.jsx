import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import ClipLoader from "react-spinners/ClipLoader";
import { Flex } from "@chakra-ui/react";

const ProtectedRoute = ({ children }) => {
  const { loadingUser, userDetails } = useUser();

  if (loadingUser) {
    return(
      <Flex height="100vh" width="100vw" alignItems="center" justifyContent="center">
        <ClipLoader color="blue" loading={true} size={150} />
      </Flex>
    )
  }

  return userDetails ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
