import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Heading,
  Input,
  Text,
  useToast,
  Badge,
  Grid,
  GridItem,
  Select,
  Textarea,
  IconButton,
} from "@chakra-ui/react";
// import { AddIcon } from "@chakra-ui/icons";
import { MdAdd } from "react-icons/md";
import AddProject from "./AddProject";
import WeeklyLeavesSummary from "./WeeklyLeavesSummary";

const Dashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState({});
  const [prevWeekReports, setPrevWeekReports] = useState([]);
  const [actualWeekReports, setActualWeekReports] = useState([]);
  const [week0, setWeek0] = useState({});
  const [week4, setWeek4] = useState({});
  const [week4Data, setWeek4Data] = useState({});
  const [leaveHours, setLeaveHours] = useState(null);
  const [duplicatedRows, setDuplicatedRows] = useState([]);
  const toast = useToast();

  let leaveHoursByWeek = null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await axios.get("/project/getprojects", {
          withCredentials: true,
        });
        setProjects(projectsResponse.data);

        // Fetch monthly report
        const monthlyResponse = await axios.get("/project/getMonthlyReport", {
          withCredentials: true,
        });

        const weekData = await axios.get("project/get4Weeks", {
          withCredentials: true,
        });

        // Fetch leaves data
        const leavesResponse = await axios.get("/project/get4WeeksLeaves", {
          withCredentials: true,
        });
        const hasValidLeaves = leavesResponse?.data?.leaves?.some(
          (leave) => leave !== null
        );
        // Create a map of weekId to leave hours
        if (hasValidLeaves) {
          setLeaveHours(1);
          leaveHoursByWeek = leavesResponse.data.leaves.reduce((acc, leave) => {
            acc[leave.weekId] = (acc[leave.weekId] || 0) + leave.hours;
            return acc;
          }, {});

          console.log(weekData.data.weeks[4].availableHours, "week4");
          setWeek4({
            ...weekData.data.weeks[4],
            availableHours:
              weekData.data.weeks[4].availableHours -
              (leaveHoursByWeek[weekData.data.weeks[4].weekId] || 0),
          });
        }

        console.log(weekData.data.weeks[0].availableHours, "week0");

        setWeek0({
          ...weekData.data.weeks[0],
          availableHours:
            weekData.data.weeks[0].availableHours -
            (leaveHoursByWeek?.[weekData.data.weeks[0].weekId] || 0),
        });

        // Group reports by weekId
        const groupedReports = monthlyResponse.data.weeklyReports.reduce(
          (acc, report) => {
            if (!acc[report.weekId]) {
              let weekLeaveHours = 0;
              if (leaveHoursByWeek != null) {
                weekLeaveHours = leaveHoursByWeek[report.weekId] || 0;
              }
              acc[report.weekId] = {
                startDate: report.Week.startDate,
                endDate: report.Week.endDate,
                availableHours: report.Week.availableHours - weekLeaveHours,
                reports: [],
              };
            }
            acc[report.weekId].reports.push(report);
            return acc;
          },
          {}
        );

        const week4Response = await axios.get("/project/getWeek4Data", {
          withCredentials: true,
        });

        // Adjust week4Data with leave hours
        if (week4Response.data) {
          let week4LeaveHours = 0;
          if (leaveHoursByWeek != null) {
            week4LeaveHours = leaveHoursByWeek[week4Response.data.weekId] || 0;
          }
          setWeek4Data({
            ...week4Response.data,
            availableHours: week4Response.data.availableHours - week4LeaveHours,
          });
        }

        setWeeklyReports(groupedReports);
        setEmployeeData(monthlyResponse.data.employee);

        const lastWeek = Object.values(groupedReports).sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        )[0];

        if (lastWeek && !week4Response.data) {
          const week4StartDate = new Date(lastWeek.startDate);
          week4StartDate.setDate(week4StartDate.getDate() + 7);

          // Get the weekId for the new week4
          const week4WeekId = weekData.data.weeks[4].weekId;
          const week4LeaveHours = leaveHoursByWeek[week4WeekId] || 0;

          setWeek4Data({
            startDate: week4StartDate.toISOString(),
            endDate: new Date(
              week4StartDate.getTime() + 6 * 24 * 60 * 60 * 1000
            ).toISOString(),
            availableHours: week4.availableHours - week4LeaveHours,
            reports: projectsResponse.data.map((project) => ({
              projectId: project.projectId,
              hours: 0,
            })),
            weekId: week4WeekId,
          });
        }

        // Fetch previous week data
        const prevWeekResponse = await axios.get("/project/getPrevWeek", {
          withCredentials: true,
        });
        setPrevWeekReports(prevWeekResponse.data.weeklyReports || []);
        setActualWeekReports(prevWeekResponse.data.actualWeeklyReport || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, []);

  const handleDuplicateRow = (project) => {
    const newRow = {
      ...project,
      projectId: `temp-${Date.now()}`,
      isNew: true,
      category: project.category,
      name: project.name,
      description: project.description,
      hours: {},
    };
    setDuplicatedRows([...duplicatedRows, newRow]);
  };

  const handleSaveRow = async (row) => {
    try {
      const response = await axios.post(
        "/project/saveNewProject",
        {
          category: row.category,
          name: row.name,
          description: row.description,
          hours: row.hours,
        },
        {
          withCredentials: true,
        }
      );

      toast({
        title: "Success",
        description: "New project row saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Remove from duplicated rows and refresh projects
      setDuplicatedRows((prev) =>
        prev.filter((p) => p.projectId !== row.projectId)
      );
      // Refresh projects list (you'll need to implement this)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save new project row",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDuplicatedRowChange = (rowId, field, value) => {
    setDuplicatedRows((prev) =>
      prev.map((row) =>
        row.projectId === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDuplicatedHoursChange = (
    rowId,
    weekType,
    value,
    weekId = null
  ) => {
    setDuplicatedRows((prev) =>
      prev.map((row) => {
        if (row.projectId === rowId) {
          return {
            ...row,
            hours: {
              ...row.hours,
              [weekType]: {
                value,
                weekId,
              },
            },
          };
        }
        return row;
      })
    );
  };

  const getHoursForProject = (projectId, weekId, isWeek4 = false) => {
    if (isWeek4) {
      const report = week4Data.reports?.find((r) => r.projectId === projectId);
      return report ? report.hours : 0;
    }
    if (!weeklyReports[weekId]) return 0;
    const report = weeklyReports[weekId].reports.find(
      (r) => r.projectId === projectId
    );
    return report ? report.hours : 0;
  };

  const getHoursForActualWeek = (projectId) => {
    // console.log(actualWeekReports);
    const report = actualWeekReports.find((r) => r.projectId === projectId);
    return report ? report.hours : 0;
  };

  const getPrevWeekHours = (projectId, isActual = false) => {
    const reports = isActual ? actualWeekReports : prevWeekReports;
    const report = reports.find((r) => r.projectId === projectId);
    return report ? report.hours : 0;
  };

  const handleChange = (projectId, value, type, weekId = null) => {
    const numValue = parseFloat(value) || 0;

    switch (type) {
      case "week4":
        // console.log(week4Data);
        setWeek4Data((prev) => ({
          ...prev,
          reports: prev.reports.map((report) =>
            report.projectId === projectId
              ? { ...report, hours: numValue }
              : report
          ),
        }));
        break;

      case "actual":
        setActualWeekReports((prev) => {
          const updatedReports = [...prev];
          const reportIndex = updatedReports.findIndex(
            (r) => r.projectId === projectId
          );
          if (reportIndex !== -1) {
            updatedReports[reportIndex].hours = numValue;
          } else {
            updatedReports.push({ projectId, hours: numValue });
          }
          return updatedReports;
        });
        break;

      case "weekly":
        setWeeklyReports((prev) => ({
          ...prev,
          [weekId]: {
            ...prev[weekId],
            reports: prev[weekId].reports.map((report) =>
              report.projectId === projectId
                ? { ...report, hours: numValue }
                : report
            ),
          },
        }));
        break;

      case "prevWeek":
        setPrevWeekReports((prev) => {
          const updatedReports = [...prev];
          const reportIndex = updatedReports.findIndex(
            (r) => r.projectId === projectId
          );
          if (reportIndex !== -1) {
            updatedReports[reportIndex].hours = numValue;
          } else {
            updatedReports.push({ projectId, hours: numValue });
          }
          return updatedReports;
        });
        break;
    }
  };

  const renderHoursField = (
    projectId,
    value,
    type,
    weekId = null,
    isSubmitted = false,
    isDuplicated = false
  ) => {
    if (isSubmitted) {
      return <Text>{value}</Text>;
    }
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          if (isDuplicated) {
            handleDuplicatedHoursChange(
              projectId,
              type,
              e.target.value,
              weekId
            );
          } else {
            handleChange(projectId, e.target.value, type, weekId);
          }
        }}
        size="sm"
        min="0"
        max="40"
        bg="white"
      />
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const sortedWeeks = Object.entries(weeklyReports).sort(
    ([, a], [, b]) => new Date(a.startDate) - new Date(b.startDate)
  );

  const calculateCapacity = (weekReports) => {
    const totalHours = weekReports.reports.reduce(
      (sum, r) => sum + (r.hours || 0),
      0
    );
    return ((totalHours / weekReports.availableHours) * 100).toFixed(2);
  };

  const calculateCapacityWeek4 = (week4Data) => {
    if (!week4Data || !week4Data.reports || week4Data.reports.length === 0) {
      return 0;
    }

    const totalHours = week4Data.reports.reduce(
      (sum, r) => sum + (r.hours || 0),
      0
    );

    return ((totalHours / week4.availableHours) * 100).toFixed(2);
  };

  if (!projects.length) return <Text>Loading...</Text>;

  const handleSubmission = async () => {
    try {
      // console.log(actualWeekReports);
      // console.log(week4Data);
      await axios.post(
        "/project/submitData",
        {
          actualWeekReports: actualWeekReports,
          week4Data,
        },
        {
          withCredentials: true,
        }
      );
      toast({
        title: "Success",
        description: "Reports submitted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      toast({
        title: "Error",
        description: "Failed to submit data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="16xl" p={4} height="950px">
      <Grid templateColumns="1fr 3fr" gap={6} height="50%">
        {/* Left Sidebar or Summary Section */}
        {/* <GridItem position="relative"> */}
        {/* {leaveHours !== null && <WeeklyLeavesSummary />} */}
        {/* </GridItem> */}

        {/* Main Content Section */}
        <GridItem>
          <Flex direction="column" align="center">
            <Heading as="h1" size="lg" mb={6}>
              Welcome, {employeeData?.name}
            </Heading>
            <Box w="full" overflowX="auto">
              <Table variant="simple" colorScheme="teal" size="sm">
                <TableCaption placement="top">
                  Weekly Hours Distribution
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th width="100px" bg="gray.50">
                      Category
                    </Th>
                    <Th width="300px" bg="gray.50">
                      Project
                    </Th>
                    <Th width="100px" bg="yellow.50">
                      Previous Week
                      <br />
                      Actual
                    </Th>
                    <Th width="100px" bg="green.50">
                      Previous Week
                      <br />
                      Planned
                      <Badge colorScheme="purple">
                        {week0.availableHours} hrs
                      </Badge>
                    </Th>
                    {sortedWeeks.map(([weekId, week], index) => (
                      <Th key={weekId} width="100px" bg="blue.50">
                        Week {index + 1}
                        <br />
                        {formatDate(week.startDate)}
                        {" - "}
                        {formatDate(week.endDate)}
                        <br />
                        <Badge colorScheme="purple">
                          {week.availableHours} hrs
                        </Badge>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {projects.map((project) => (
                    <Tr key={project.projectId}>
                      <Td>
                        <Flex alignItems="center">
                          <Badge
                            colorScheme={
                              project.category === "Projects" ? "green" : "blue"
                            }
                          >
                            {project.category}
                          </Badge>
                          {/* <IconButton
                            ml={2}
                            icon={<MdAdd />}
                            size="sm"
                            onClick={() => handleDuplicateRow(project)}
                            aria-label="Duplicate row"
                          /> */}
                        </Flex>
                      </Td>
                      <Td>
                        <Text fontWeight="medium">{project.name}</Text>
                        <Text fontSize="xs" color="gray.600" noOfLines={3}>
                          {project.description}
                        </Text>
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          project.projectId,
                          getHoursForActualWeek(project.projectId),
                          "actual",
                          null,
                          actualWeekReports.find(
                            (r) => r.projectId === project.projectId
                          )?.Submitted === 1
                        )}
                      </Td>
                      <Td bg="green.50">
                        {renderHoursField(
                          project.projectId,
                          getPrevWeekHours(project.projectId),
                          "prevWeek",
                          null,
                          prevWeekReports.find(
                            (r) => r.projectId === project.projectId
                          )?.Submitted === 1
                        )}
                      </Td>
                      {sortedWeeks.slice(0, 3).map(([weekId, week]) => (
                        <Td key={weekId} bg="blue.50">
                          {renderHoursField(
                            project.projectId,
                            getHoursForProject(project.projectId, weekId),
                            "weekly",
                            weekId,
                            week.reports.find(
                              (r) => r.projectId === project.projectId
                            )?.Submitted === 1
                          )}
                        </Td>
                      ))}
                      <Td bg="purple.50">
                        {renderHoursField(
                          project.projectId,
                          week4Data?.reports?.find(
                            (r) => r.projectId === project.projectId
                          )?.hours || 0,
                          "week4",
                          null,
                          week4Data?.reports?.find(
                            (r) => r.projectId === project.projectId
                          )?.Submitted === 1
                        )}
                      </Td>
                    </Tr>
                  ))}
                  {duplicatedRows.map((row) => (
                    <Tr key={row.projectId}>
                      <Td>
                        <Select
                          value={row.category}
                          onChange={(e) =>
                            handleDuplicatedRowChange(
                              row.projectId,
                              "category",
                              e.target.value
                            )
                          }
                          size="sm"
                        >
                          <option value="Projects">Projects</option>
                          <option value="Other">Other</option>
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          value={row.name}
                          onChange={(e) =>
                            handleDuplicatedRowChange(
                              row.projectId,
                              "name",
                              e.target.value
                            )
                          }
                          size="sm"
                          mb={2}
                        />
                        <Textarea
                          value={row.description}
                          onChange={(e) =>
                            handleDuplicatedRowChange(
                              row.projectId,
                              "description",
                              e.target.value
                            )
                          }
                          size="sm"
                          rows={2}
                        />
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          row.projectId,
                          row.hours?.actual?.value || 0,
                          "actual",
                          null,
                          false,
                          true
                        )}
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          row.projectId,
                          row.hours?.actual?.value || 0,
                          "actual",
                          null,
                          false,
                          true
                        )}
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          row.projectId,
                          row.hours?.actual?.value || 0,
                          "actual",
                          null,
                          false,
                          true
                        )}
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          row.projectId,
                          row.hours?.actual?.value || 0,
                          "actual",
                          null,
                          false,
                          true
                        )}
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          row.projectId,
                          row.hours?.actual?.value || 0,
                          "actual",
                          null,
                          false,
                          true
                        )}
                      </Td>
                      <Td bg="yellow.50">
                        {renderHoursField(
                          row.projectId,
                          row.hours?.actual?.value || 0,
                          "actual",
                          null,
                          false,
                          true
                        )}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleSaveRow(row)}
                        >
                          Save
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                  <Tr fontWeight="bold">
                    <Td colSpan={2}>Total Hours</Td>
                    <Td bg="yellow.50">
                      {actualWeekReports.reduce(
                        (sum, r) => sum + (r.hours || 0),
                        0
                      )}
                    </Td>
                    <Td bg="green.50">
                      {prevWeekReports.reduce(
                        (sum, r) => sum + (r.hours || 0),
                        0
                      )}
                    </Td>
                    {sortedWeeks.slice(0, 3).map(([weekId]) => (
                      <Td key={weekId} bg="blue.50">
                        {weeklyReports[weekId].reports.reduce(
                          (sum, r) => sum + (r.hours || 0),
                          0
                        )}
                      </Td>
                    ))}
                    <Td bg="purple.50">
                      {week4Data.reports?.reduce(
                        (sum, r) => sum + (r.hours || 0),
                        0
                      ) || 0}
                    </Td>
                  </Tr>
                  <Tr fontWeight="bold">
                    <Td colSpan={2}>Percentage Capacity</Td>
                    <Td bg="yellow.50">
                      {calculateCapacity({
                        reports: actualWeekReports,
                        availableHours: week0.availableHours,
                      })}
                      %
                    </Td>
                    <Td bg="green.50">
                      {calculateCapacity({
                        reports: prevWeekReports,
                        availableHours: week0.availableHours,
                      })}
                      %
                    </Td>
                    {sortedWeeks.slice(0, 3).map(([weekId, week]) => (
                      <Td key={weekId} bg="blue.50">
                        {calculateCapacity(weeklyReports[weekId])}%
                      </Td>
                    ))}
                    <Td bg="purple.50">
                      {week4.availableHours
                        ? calculateCapacityWeek4(week4Data)
                        : 0}
                      %
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
            <Box mt={4}>
              {!actualWeekReports.some((r) => r.Submitted === 1) && (
                <Button colorScheme="teal" onClick={handleSubmission}>
                  Submit Weekly Report
                </Button>
              )}
            </Box>
          </Flex>
        </GridItem>
      </Grid>
      {!actualWeekReports.some((r) => r.Submitted === 1) && <AddProject />}
    </Container>
  );
};

export default Dashboard;
