import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Login failed.",
        description: "Please fill in both fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const response = await axios.post(
      "/employee/login",
      { email, password },
      { withCredentials: true }
    );
    if (response.status !== 200) {
      toast({
        title: "Login failed.",
        description: "Invalid email or password.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: "Login successful.",
      description: `Welcome back, ${email}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/dashboard");
  };

  return (
    <Flex
      minH="100vh"
      minW="100vw"
      align="center"
      justify="center"
      bg="gray.800"
    >
      <Box
        bg="gray.700"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        width="100%"
        maxWidth="400px"
        color="white"
      >
        <Heading as="h2" size="lg" textAlign="center" mb={6}>
          Login
        </Heading>
        <Stack spacing={4}>
          <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="gray.600"
              _hover={{ bg: "gray.500" }}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="gray.600"
              _hover={{ bg: "gray.500" }}
            />
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={handleLogin}
            _hover={{ bg: "teal.500" }}
            width="100%"
          >
            Login
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
};

export default LoginPage;
