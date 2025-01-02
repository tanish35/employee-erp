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
    <div>
      {leavesByWeek.map((week) => (
        <Text fontWeight="bold" display="inline" mr="2">
          Leaves:
          <Text fontWeight="bold" display="inline" ml="1">
            {week.leaveDays}
            <Text as="span" ml="1" display="inline">
              {week.leaveDays > 1 ? "days" : "day"}
            </Text>
          </Text>
        </Text>
      ))}
    </div>
  );
};

export default WeeklyLeavesSummary;
