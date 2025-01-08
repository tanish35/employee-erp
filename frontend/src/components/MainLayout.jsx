import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await axios.post(
      "/employee/logout",
      {},
      {
        withCredentials: true,
      }
    );
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login");
  };

  return (
    <Box display="flex" height="100vh" bg="gray.50" overflowY="auto">
      <Box
        width={isCollapsed ? "80px" : "250px"}
        bg="gray.100"
        p={4}
        borderRight="1px solid"
        borderColor="gray.300"
        transition="width 0.3s"
        display="flex"
        flexDirection="column"
        height={isCollapsed ? "100vh" : "auto"}
        alignItems={isCollapsed ? "center" : "flex-start"}
      >
        {/* Toggle Button */}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          mb={4}
          alignSelf={isCollapsed ? "center" : "flex-end"}
        />

        <VStack
          spacing={4}
          align={isCollapsed ? "center" : "stretch"}
          width="100%"
        >
          <Button
            colorScheme="blue"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            justifyContent={isCollapsed ? "center" : "flex-start"}
          >
            {!isCollapsed && <Text>📊 4 week Rolling Plan</Text>}
            {isCollapsed && <Text>📊</Text>}{" "}
            {/* Replace with an icon if desired */}
          </Button>
          <Button
            colorScheme="blue"
            variant="ghost"
            onClick={() => navigate("/history")}
            justifyContent={isCollapsed ? "center" : "flex-start"}
          >
            {!isCollapsed && <Text>📜 History</Text>}
            {isCollapsed && <Text>📜</Text>}{" "}
            {/* Replace with an icon if desired */}
          </Button>
          <Button
            colorScheme="red"
            variant="ghost"
            onClick={handleLogout}
            justifyContent={isCollapsed ? "center" : "flex-start"}
          >
            {!isCollapsed && <Text>🚪 Logout</Text>}
            {isCollapsed && <Text>🚪</Text>}{" "}
          </Button>
        </VStack>
      </Box>

      {/* Content Area */}
      <Box flex="1" p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
