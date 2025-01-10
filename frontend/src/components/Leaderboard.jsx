"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Heading,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import axios from "axios";
import { format } from "date-fns";

const pulseKeyframes = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function AnimatedEmployeeLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekData, setWeekData] = useState(null);

  const leaderboardRef = useRef(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await axios.get("/leaderboard/getLeaderboard");
        setLeaderboard(response.data.leaderboard);
        setWeekData(response.data.currentWeek);
      } catch (err) {
        setError("Error fetching leaderboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const formattedWeek =
    weekData &&
    `${format(new Date(weekData.startDate), "do MMM")} - ${format(
      new Date(weekData.endDate),
      "do MMM"
    )}`;

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      p={8}
      boxShadow="xl"
      maxWidth="100vw"
      margin="auto"
    >
      <VStack spacing={8} align="stretch" w="88vw">
        <Heading as="h2" size="2xl" textAlign="center" mb={6}>
          Employee Leaderboard
        </Heading>
        {formattedWeek && (
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Box flex="1" />
            <Text fontSize="xl" color="gray.500" textAlign="center" flex="2">
              {formattedWeek}
            </Text>
            <Text
              fontSize="xl"
              color="blue.500"
              fontWeight="bold"
              textAlign="right"
              flex="1"
            >
              Available Hours: {weekData.availableHours || "N/A"}
            </Text>
          </Flex>
        )}

        <Box overflowX="auto">
          <Table variant="simple" size="md">
            {" "}
            {/* Changed size for more spacious rows */}
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Name</Th>
                <Th isNumeric>Planned hrs</Th>
                <Th isNumeric>Actual hrs</Th>
                <Th isNumeric>Leave hrs</Th>
                <Th isNumeric>Capacity</Th>
              </Tr>
            </Thead>
            <Tbody ref={leaderboardRef}>
              {leaderboard.map((employee, index) => (
                <>
                  {index === 3 && (
                    <Tr height="3rem">
                      <Td colSpan={6} border="none" />
                    </Tr>
                  )}
                  <Tr
                    key={employee.id}
                    bg={cardBgColor}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    boxShadow="md"
                    transition="all 0.3s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    h="6rem"
                  >
                    <Td
                      fontWeight="bold"
                      color={
                        index < 3
                          ? "gold"
                          : index >= leaderboard.length - 3
                          ? "red.500"
                          : textColor
                      }
                    >
                      #{index + 1}
                    </Td>
                    <Td fontWeight="bold">{employee.name}</Td>
                    <Td isNumeric>{employee.plannedHours}</Td>
                    <Td isNumeric>{employee.actualHours}</Td>
                    <Td isNumeric>{employee.leaveHours}</Td>
                    <Td isNumeric>
                      <Box
                        as="span"
                        bg={
                          employee.capacityPercentage >= 80
                            ? "green.500"
                            : employee.capacityPercentage >= 50
                            ? "yellow.500"
                            : "red.500"
                        }
                        color="white"
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {employee.capacityPercentage}%
                      </Box>
                    </Td>
                  </Tr>
                </>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
}
