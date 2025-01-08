import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Flex, Spinner, IconButton, Td } from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";

const WeeklyLeaveRow = () => {
  const [leavesByWeek, setLeavesByWeek] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesResponse, weeksResponse] = await Promise.all([
          axios.get("/project/get4WeeksLeaves", { withCredentials: true }),
          axios.get("/project/get4Weeks", { withCredentials: true }),
        ]);

        const leaves = leavesResponse.data.leaves;
        const weeks = weeksResponse.data.weeks;

        const leaveData = weeks.map((week) => {
          const totalLeaveHours = leaves
            .filter((leave) => leave.weekId === week.weekId)
            .reduce((acc, leave) => acc + leave.hours, 0);

          const leaveDays = (totalLeaveHours / 7).toFixed(1);

          return {
            weekId: week.weekId,
            startDate: week.startDate,
            endDate: week.endDate,
            leaveDays: parseFloat(leaveDays),
          };
        });

        setLeavesByWeek(leaveData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLeaveChange = async (weekId, action) => {
    try {
      await axios.post(
        "/project/updateLeave",
        { weekId, action },
        { withCredentials: true }
      );
      console.log(weekId, action);
      window.location.reload();

      // setLeavesByWeek((prevLeaves) =>
      //   prevLeaves.map((week) => {
      //     if (week.weekId === weekId) {
      //       const newLeaveDays =
      //         action === "add"
      //           ? week.leaveDays + 0.1
      //           : Math.max(0, week.leaveDays - 0.1);
      //       return { ...week, leaveDays: parseFloat(newLeaveDays.toFixed(1)) };
      //     }
      //     return week;
      //   })
      // );
    } catch (error) {
      console.error(`Failed to ${action} leave:`, error);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="24" w="full">
        <Spinner size="lg" color="gray.900" />
      </Flex>
    );
  }

  const renderWeekTd = (week, bgColor) => (
    <Td
      key={week.weekId}
      bg={bgColor}
      minWidth={28}
      p={2}
      borderRadius="md"
      transition="all 0.2s"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <IconButton
          aria-label="Remove leave"
          icon={<MinusIcon boxSize={3} />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          opacity={0.6}
          _hover={{ opacity: 1, bg: "red.100" }}
          onClick={() => handleLeaveChange(week.weekId, "remove")}
        />
        <Text fontWeight="medium" fontSize="sm">
          {week.leaveDays.toFixed(1)}
          <Text as="span" fontSize="xs" ml={1} color="gray.500">
            {week.leaveDays > 1 ? "days" : "day"}
          </Text>
        </Text>
        <IconButton
          aria-label="Add leave"
          icon={<AddIcon boxSize={3} />}
          size="sm"
          variant="ghost"
          colorScheme="green"
          opacity={0.6}
          _hover={{ opacity: 1, bg: "green.100" }}
          onClick={() => handleLeaveChange(week.weekId, "add")}
        />
      </Flex>
    </Td>
  );

  return (
    <>
      {renderWeekTd(leavesByWeek[0], "green.50")}
      {leavesByWeek.slice(1, 4).map((week) => renderWeekTd(week, "blue.50"))}
      {renderWeekTd(leavesByWeek[4], "purple.50")}
    </>
  );
};

export default WeeklyLeaveRow;
