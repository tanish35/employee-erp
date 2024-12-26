import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  VStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const WeeklyLeavesSummary = () => {
  const [leaves, setLeaves] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchLeavesAndWeeks = async () => {
      try {
        // Fetch leaves data
        const leavesResponse = await axios.get("/project/get4WeeksLeaves", {
          withCredentials: true,
        });
        setLeaves(leavesResponse.data.leaves);

        // Fetch weeks data
        const weeksResponse = await axios.get("/project/get4Weeks", {
          withCredentials: true,
        });
        setWeeks(weeksResponse.data.weeks);

        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leave or week data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };

    fetchLeavesAndWeeks();
  }, []);

  // Map leaves to weeks
  const leavesByWeek = weeks.map((week) => {
    const totalLeaveHours = leaves
      .filter((leave) => leave.weekId === week.weekId)
      .reduce((acc, leave) => acc + leave.hours, 0);

    const leaveDays = (totalLeaveHours / 8).toFixed(1);

    return {
      weekId: week.weekId,
      startDate: week.startDate,
      endDate: week.endDate,
      leaveDays,
    };
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box
      bg="gray.700"
      color="white"
      p={6}
      borderRadius="md"
      boxShadow="md"
      maxWidth="400px"
      position="absolute"
      top="10px"
      right="10px"
    >
      <Heading as="h3" size="md" mb={4}>
        Weekly Leaves Summary
      </Heading>
      <VStack spacing={4} align="start">
        {leavesByWeek.map((week) => (
          <Box
            key={week.weekId}
            bg="gray.600"
            p={4}
            borderRadius="md"
            w="100%"
            boxShadow="sm"
          >
            <Text fontWeight="bold">
              {new Date(week.startDate).toLocaleDateString()} -{" "}
              {new Date(week.endDate).toLocaleDateString()}
            </Text>
            <Text>
              Leave Days:{" "}
              <Text
                as="span"
                color={week.leaveDays > 0 ? "red.400" : "green.400"}
                fontWeight="bold"
              >
                {week.leaveDays} day(s)
              </Text>
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default WeeklyLeavesSummary;
