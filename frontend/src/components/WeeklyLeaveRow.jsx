import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Flex, Spinner, IconButton, Td } from "@chakra-ui/react";

const WeeklyLeaveRow = () => {
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

  const leavesByWeek = weeks.map((week) => {
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
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="24" w="full">
        <Spinner size="lg" color="gray.900" />
      </Flex>
    );
  }

  return (
    <>
      {leavesByWeek.slice(0, 1).map((week) => (
        <Td key={week.id} bg="green.50">
          {week.leaveDays} {week.leaveDays > 1 ? "days" : "day"}
        </Td>
      ))}
      {leavesByWeek.slice(1, 4).map((week) => (
        <Td key={week.id} bg="blue.50">
          {week.leaveDays} {week.leaveDays > 1 ? "days" : "day"}
        </Td>
      ))}
      {leavesByWeek.slice(4, 5).map((week) => (
        <Td key={week.id} bg="purple.50">
          {week.leaveDays} {week.leaveDays > 1 ? "days" : "day"}
        </Td>
      ))}
    </>
  );
};

export default WeeklyLeaveRow;
