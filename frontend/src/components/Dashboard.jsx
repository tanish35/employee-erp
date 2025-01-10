import React, { useState, useEffect, act } from "react";
import axios from "axios";
import Dropdown from "./Dropdown";
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
  Image,
} from "@chakra-ui/react";
// import { AddIcon } from "@chakra-ui/icons";
import { MdAdd } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import WeeklyLeaveRow from "./WeeklyLeaveRow";
import { MdDelete } from "react-icons/md";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Card, CardBody, VStack, HStack, Icon } from "@chakra-ui/react";
import {
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaUmbrellaBeach,
} from "react-icons/fa";
import AddProject from "./AddProject";
// import WeeklyLeavesSummary from "./WeeklyLeavesSummary";

const Dashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState({});
  const [prevWeekReports, setPrevWeekReports] = useState([]);
  const [actualWeekReports, setActualWeekReports] = useState([]);
  const [week0, setWeek0] = useState({});
  const [week1, setWeek1] = useState({});
  const [week2, setWeek2] = useState({});
  const [week3, setWeek3] = useState({});
  const [week4, setWeek4] = useState({});
  const [week4Data, setWeek4Data] = useState({});
  const [leaveHours, setLeaveHours] = useState(null);
  const [duplicatedRows, setDuplicatedRows] = useState({});
  const [fetchDataBool, setFetchDataBool] = useState(false);
  const [week0ActualHours, setWeek0ActuaHours] = useState(0);
  const [week0ActualLeaveDays, setWeek0ActualLeaveDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("me");

  // const [week0ActualPercentage, setWeek0ActualPercentage] = useState(0);

  const toast = useToast();

  let leaveHoursByWeek = null;

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Use selectedEmployee as the employeeId
        const employeeId = selectedEmployee;

        // Fetch projects
        const projectsResponse = await axios.get("/project/getprojects", {
          params: { employeeId },
          withCredentials: true,
        });
        setProjects(projectsResponse.data);

        // Fetch monthly report
        const monthlyResponse = await axios.get("/project/getMonthlyReport", {
          params: { employeeId },
          withCredentials: true,
        });

        const weekData = await axios.get("project/get4Weeks", {
          params: { employeeId },
          withCredentials: true,
        });
        setWeek1(weekData.data.weeks[1]);
        setWeek2(weekData.data.weeks[2]);
        setWeek3(weekData.data.weeks[3]);
        setWeek0ActuaHours(weekData.data.weeks[0].availableHours);

        // Fetch leaves data
        const leavesResponse = await axios.get("/project/get4WeeksLeaves", {
          params: { employeeId },
          withCredentials: true,
        });

        const actualLeaveResponse = await axios.get(
          "/project/getActualLeaves",
          {
            params: { employeeId },
            withCredentials: true,
          }
        );

        setWeek0ActuaHours(
          weekData.data.weeks[0].availableHours -
            actualLeaveResponse.data.actualLeave.hours
        );
        setWeek0ActualLeaveDays(actualLeaveResponse.data.actualLeave.hours / 7);

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
          params: { employeeId },
          withCredentials: true,
        });
        setLoading(false);

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
          params: { employeeId },
          withCredentials: true,
        });
        setPrevWeekReports(prevWeekResponse.data.weeklyReports || []);
        setActualWeekReports(prevWeekResponse.data.actualWeeklyReport || []);
      } catch (error) {
        setLoading(false);
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
  }, [fetchDataBool]);

  const handleDuplicateRow = (project) => {
    const projectId = `temp-${Date.now()}`;
    const newRow = {
      projectId,
      isNew: true,
      category: project.category || "",
      name: project.name || "",
      description: project.description || "",
      hours: {
        actual: { value: 0, weekId: "actualWeekId" },
        prevWeek: { value: 0, weekId: "prevWeekId" },
        week1: { value: 0, weekId: "week1Id" },
        week2: { value: 0, weekId: "week2Id" },
        week3: { value: 0, weekId: "week3Id" },
        week4: { value: 0, weekId: "week4Id" },
      },
    };

    setDuplicatedRows((prev) => ({
      ...prev,
      [projectId]: newRow,
    }));
  };

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
    setFetchDataBool((prevState) => !prevState);
  };

  const handleSaveRow = async (row) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "/project/saveNewProject",
        {
          category: row.category,
          name: row.name,
          description: row.description,
          hours: row.hours,
        },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: "New project row saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Remove saved row
      setDuplicatedRows((prev) => {
        const newRows = { ...prev };
        delete newRows[row.projectId];
        return newRows;
      });
      if (fetchDataBool) {
        setFetchDataBool(false);
      } else {
        setFetchDataBool(true);
      }
      setLoading(false);
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
    setDuplicatedRows((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));
  };

  // Function to handle changes to hours
  const handleDuplicatedHoursChange = (rowId, weekType, value) => {
    setDuplicatedRows((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        hours: {
          ...prev[rowId].hours,
          [weekType]: {
            ...prev[rowId].hours[weekType],
            value,
          },
        },
      },
    }));
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

  // useEffect(() => {
  //   console.log(actualWeekReports);
  // }, [actualWeekReports]);

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

  const handleDeleteRow = async (projectId) => {
    try {
      await axios.post(
        "/project/deleteProject",
        {
          projectId,
        },
        { withCredentials: true }
      );
      toast({
        title: "Success",
        description: "Project completed successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (fetchDataBool) {
        setFetchDataBool(false);
      } else {
        setFetchDataBool(true);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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

  // if (!projects.length) return <Text>Loading...</Text>;

  const handleSubmission = async () => {
    try {
      console.log(actualWeekReports);
      console.log(prevWeekReports);
      console.log(weeklyReports);
      await axios.post(
        "/project/submitData",
        {
          actualWeekReports: actualWeekReports,
          prevWeekReports,
          weeklyReports,
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

  const handleLeaveChange = async (weekId, action) => {
    try {
      await axios.post(
        "/project/updateActualLeave",
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

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh" w="100vw">
        <ClipLoader size={80} color="gray.900" />
      </Flex>
    );
  }

  return (
    <Container
      maxW="100vw"
      p={4}
      height="100vh"
      overflowY="auto"
      overflowX="auto"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* <Flex justifyContent="flex-end" alignItems="center" mb={4}>
        <Button colorScheme="red" onClick={() => console.log("Logout clicked")}>
          Logout
        </Button>
      </Flex> */}
      <Grid templateColumns="1fr 3fr" gap={6} height="50%">
        <GridItem>
          <Image
            src="polycab1.png"
            alt="Polycab Logo"
            width="300px"
            height="200px"
            mt={-50}
            ml={-10}
          />
          <Flex direction="column" align="center">
            <Card w="80vw" boxShadow="md" borderRadius="lg" mt={-30}>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FaUser} color="blue.500" />
                        <Text fontWeight="bold">Name:</Text>
                        <Text>{employeeData?.name}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaBuilding} color="green.500" />
                        <Text fontWeight="bold">Department:</Text>
                        <Text>{employeeData?.department || "Engineering"}</Text>
                      </HStack>
                    </VStack>
                  </GridItem>
                  <GridItem>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FaCalendarAlt} color="purple.500" />
                        <Text fontWeight="bold">Week Starting:</Text>
                        <Text>
                          {formatDate(prevWeekReports[0]?.Week?.startDate)}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaUmbrellaBeach} color="orange.500" />
                        <Text fontWeight="bold">Leaves:</Text>
                        <Text>{week0ActualLeaveDays} days</Text>
                      </HStack>
                    </VStack>
                  </GridItem>
                </Grid>
              </CardBody>
              <Dropdown
                selectedEmployee={selectedEmployee}
                onEmployeeChange={handleEmployeeChange}
              />
            </Card>
            <Heading as="h1" size="lg" mb={6}></Heading>
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
                      Current Week
                      <br />
                      Actual
                      <Badge colorScheme="purple">{week0ActualHours} hrs</Badge>
                    </Th>
                    <Th width="100px" bg="green.50">
                      Current Week
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
                        <Flex
                          alignItems="center"
                          justify="space-between"
                          width="full"
                        >
                          <Badge
                            colorScheme={
                              project.category === "Projects" ? "green" : "blue"
                            }
                            minWidth="100px"
                            textAlign="center"
                          >
                            {project.category}
                          </Badge>
                          <Flex alignItems="center">
                            {selectedEmployee == "me" && (
                              <IconButton
                                icon={<MdAdd />}
                                size="sm"
                                onClick={() => handleDuplicateRow(project)}
                                aria-label="Duplicate row"
                                ml={2}
                              />
                            )}
                            {selectedEmployee == "me" && (
                              <IconButton
                                icon={<MdDelete />}
                                size="sm"
                                onClick={() =>
                                  handleDeleteRow(project.projectId)
                                }
                                aria-label="Delete row"
                                ml={2}
                              />
                            )}
                          </Flex>
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
                  {Object.values(duplicatedRows).map((row) => (
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
                          <option value="Operational">Operational</option>
                          <option value="Strategic">Strategic</option>
                          <option value="Roadmap">Roadmap</option>
                          <option value="Other">Other</option>
                        </Select>
                      </Td>
                      <Td>
                        {row.category === "Roadmap" ? (
                          <Select
                            value={row.name}
                            onChange={(e) =>
                              handleDuplicatedRowChange(
                                row.projectId,
                                "name",
                                e.target.value
                              )
                            }
                            size="sm"
                          >
                            <option value="Project A">Project A</option>
                            <option value="Project B">Project B</option>
                            <option value="Project C">Project C</option>
                          </Select>
                        ) : (
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
                        )}
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
                      {[
                        "actual",
                        "prevWeek",
                        "week1",
                        "week2",
                        "week3",
                        "week4",
                      ].map((weekType) => (
                        <Td key={weekType} bg="yellow.50">
                          <Input
                            bg="white"
                            value={row.hours[weekType]?.value || 0}
                            onChange={(e) =>
                              handleDuplicatedHoursChange(
                                row.projectId,
                                weekType,
                                +e.target.value
                              )
                            }
                            size="sm"
                            type="number"
                          />
                        </Td>
                      ))}
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
                    <Td colSpan={2}>Total Leaves(In Days)</Td>
                    <Td
                      bg="yellow.50"
                      transition="all 0.2s"
                      minWidth={28}
                      _hover={{
                        boxShadow: "md",
                        transform: "translateY(-2px)",
                      }}
                      px={2}
                    >
                      <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        ml={-2}
                      >
                        {selectedEmployee == "me" && (
                          <IconButton
                            aria-label="Remove leave"
                            icon={<MinusIcon boxSize={3} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            opacity={0.6}
                            _hover={{ opacity: 1, bg: "red.100" }}
                            onClick={() =>
                              handleLeaveChange(week0.weekId, "remove")
                            }
                          />
                        )}
                        <Text fontWeight="medium" fontSize="sm">
                          {week0ActualLeaveDays.toFixed(1)}
                          <Text as="span" fontSize="xs" ml={1} color="gray.500">
                            {week0ActualLeaveDays > 1 ? "days" : "day"}
                          </Text>
                        </Text>
                        {selectedEmployee == "me" && (
                          <IconButton
                            aria-label="Add leave"
                            icon={<AddIcon boxSize={3} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            opacity={0.6}
                            _hover={{ opacity: 1, bg: "green.100" }}
                            onClick={() =>
                              handleLeaveChange(week0.weekId, "add")
                            }
                          />
                        )}
                      </Flex>
                    </Td>

                    <WeeklyLeaveRow selectedEmployee={selectedEmployee} />
                  </Tr>
                  <Tr fontWeight="bold">
                    <Td colSpan={2}>Percentage Capacity</Td>
                    <Td bg="yellow.50">
                      {calculateCapacity({
                        reports: actualWeekReports,
                        availableHours: week0ActualHours,
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
            <Box
              mt={4}
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="row"
            >
              {!actualWeekReports.some((r) => r.Submitted === 1) &&
                selectedEmployee == "me" && (
                  <Button colorScheme="teal" onClick={handleSubmission}>
                    Submit Weekly Report
                  </Button>
                )}
              {!actualWeekReports.some((r) => r.Submitted === 1) &&
                selectedEmployee == "me" && <AddProject />}
            </Box>
          </Flex>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Dashboard;
