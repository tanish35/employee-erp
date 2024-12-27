import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Flex, Spinner, IconButton } from "@chakra-ui/react";
import { Rnd } from "react-rnd";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const WeeklyLeavesSummary = () => {
  const [leaves, setLeaves] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesResponse, weeksResponse] = await Promise.all([
          axios.get("/project/get4WeeksLeaves", { withCredentials: true }),
          axios.get("/project/get4Weeks", { withCredentials: true }),
        ]);

        setLeaves(leavesResponse.data.leaves);
        setWeeks(weeksResponse.data.weeks);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const leavesByWeek = weeks
    .map((week) => {
      const totalLeaveHours = leaves
        .filter((leave) => leave.weekId === week.weekId)
        .reduce((acc, leave) => acc + leave.hours, 0);

      const leaveDays = (totalLeaveHours / 7).toFixed(1);

      return {
        weekId: week.weekId,
        startDate: week.startDate,
        endDate: week.endDate,
        leaveDays,
      };
    })
    .slice(0, 1);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="24" w="full">
        <Spinner size="lg" color="gray.900" />
      </Flex>
    );
  }

  return (
    <Rnd
      default={{
        x: 0,
        y: 550,
        width: 300,
        height: "auto",
      }}
      bounds="window"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <Box
        w="full"
        p="4"
        borderWidth="1px"
        borderRadius="md"
        shadow="md"
        bg="white"
        position="relative"
      >
        <IconButton
          position="absolute"
          top="2"
          right="2"
          size="10px"
          icon={isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle Box"
        />
        {!isCollapsed && (
          <>
            <Box mb="4">
              <Text fontSize="sm" fontWeight="medium">
                Recent Leaves
              </Text>
            </Box>
            <Flex direction="column" gap="2">
              {leavesByWeek.map((week) => (
                <Box
                  key={week.weekId}
                  p="2"
                  borderRadius="md"
                  bg={Number(week.leaveDays) > 0 ? "red.100" : "green.100"}
                >
                  <Text fontSize="xs" color="gray.600">
                    Planned
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {week.leaveDays}
                    <Text as="span" fontSize="xs" ml="1">
                      {week.leaveDays > 1 ? "days" : "day"}
                    </Text>
                  </Text>
                </Box>
              ))}
            </Flex>
          </>
        )}
      </Box>
    </Rnd>
  );
};

export default WeeklyLeavesSummary;
