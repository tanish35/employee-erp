import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { gsap } from "gsap";
import axios from "axios";
import { format } from "date-fns";

const pulseKeyframes = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function AnimatedEmployeeLeaderboard() {
  const [top3, setTop3] = useState([]);
  const [bottom3, setBottom3] = useState([]);
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
        setTop3(response.data.top3);
        setBottom3(response.data.bottom3);
        setWeekData(response.data.prevWeek);
      } catch (err) {
        setError("Error fetching leaderboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!isLoading && leaderboardRef.current) {
      gsap.from(leaderboardRef.current.children, {
        opacity: 100,
        y: 50,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [isLoading]);

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
      <VStack spacing={8} align="stretch" w="88vw" h="100vh">
        <Heading as="h2" size="2xl" textAlign="center" mb={6}>
          Employee Leaderboard
        </Heading>
        {formattedWeek && (
          <Text textAlign="center" fontSize="3rem" color="gray.500" mb={6}>
            {formattedWeek}
          </Text>
        )}
        <VStack ref={leaderboardRef} align="stretch">
          {/* <Heading as="h3" size="lg" textAlign="center" mt={4}>
            Top 3 Employees
          </Heading> */}
          {top3.map((employee, index) => (
            <Flex
              key={employee.id}
              bg={cardBgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              p={4}
              alignItems="center"
              justifyContent="space-between"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              animation={`${pulseKeyframes} 2s infinite`}
            >
              <Flex alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" mr={4} color="gold">
                  #{index + 1}
                </Text>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {employee.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {employee.totalHoursWorked} / {employee.effectiveHours}{" "}
                    hours
                  </Text>
                </VStack>
              </Flex>
              <Box
                bg={
                  employee.capacityPercentage >= 80
                    ? "green.500"
                    : employee.capacityPercentage >= 50
                    ? "yellow.500"
                    : "red.500"
                }
                color="white"
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="bold"
              >
                {employee.capacityPercentage}%
              </Box>
            </Flex>
          ))}

          {/* <Heading as="h3" size="lg" textAlign="center" mt={10}>
            Bottom 3 Employees
          </Heading> */}
          {bottom3.map((employee, index) => (
            <Flex
              key={employee.id}
              bg={cardBgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              p={4}
              alignItems="center"
              justifyContent="space-between"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            >
              <Flex alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" mr={4} color="red.500">
                  #{top3.length + index + 1}
                </Text>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {employee.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {employee.totalHoursWorked} / {employee.effectiveHours}{" "}
                    hours
                  </Text>
                </VStack>
              </Flex>
              <Box
                bg={
                  employee.capacityPercentage >= 80
                    ? "green.500"
                    : employee.capacityPercentage >= 50
                    ? "yellow.500"
                    : "red.500"
                }
                color="white"
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="bold"
              >
                {employee.capacityPercentage}%
              </Box>
            </Flex>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
