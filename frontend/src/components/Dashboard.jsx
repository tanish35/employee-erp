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
} from "@chakra-ui/react";
import AddProject from "./AddProject";

const Dashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState({});
  const [prevWeekReports, setPrevWeekReports] = useState([]);
  const [actualWeekReports, setActualWeekReports] = useState([]);
  const [week0, setWeek0] = useState({});
  //   const [week1, setWeek1] = useState({});
  //   const [week2, setWeek2] = useState({});
  //   const [week3, setWeek3] = useState({});
  const [week4, setWeek4] = useState({});
  const [week4Data, setWeek4Data] = useState({});
  const toast = useToast();

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

        setWeek0(weekData.data.weeks[0]);
        // setWeek1(weekData.data.weeks[1]);
        // setWeek2(weekData.data.weeks[2]);
        // setWeek3(weekData.data.weeks[3]);
        setWeek4(weekData.data.weeks[4]);
        console.log(week4);

        // Group reports by weekId
        const groupedReports = monthlyResponse.data.weeklyReports.reduce(
          (acc, report) => {
            if (!acc[report.weekId]) {
              acc[report.weekId] = {
                startDate: report.Week.startDate,
                endDate: report.Week.endDate,
                availableHours: report.Week.availableHours,
                reports: [],
              };
            }
            acc[report.weekId].reports.push(report);
            return acc;
          },
          {}
        );

        setWeeklyReports(groupedReports);
        setEmployeeData(monthlyResponse.data.employee);

        const lastWeek = Object.values(groupedReports).sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        )[0];

        if (lastWeek) {
          const week4StartDate = new Date(lastWeek.startDate);
          week4StartDate.setDate(week4StartDate.getDate() + 7);

          setWeek4Data({
            startDate: week4StartDate.toISOString(),
            endDate: new Date(
              week4StartDate.getTime() + 6 * 24 * 60 * 60 * 1000
            ).toISOString(),
            availableHours: week4.availableHours,
            reports: projectsResponse.data.map((project) => ({
              projectId: project.projectId,
              hours: 0,
            })),
          });
        }

        // Fetch previous week data
        const prevWeekResponse = await axios.get("/project/getPrevWeek", {
          withCredentials: true,
        });
        setPrevWeekReports(prevWeekResponse.data.weeklyReports || []);
        setActualWeekReports(prevWeekResponse.data.actualWeeklyReports || []);
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
  }, [week4]);

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

  const getPrevWeekHours = (projectId, isActual = false) => {
    const reports = isActual ? actualWeekReports : prevWeekReports;
    const report = reports.find((r) => r.projectId === projectId);
    return report ? report.hours : 0;
  };

  const handleChange = (projectId, value, type) => {
    const numValue = parseFloat(value) || 0;

    if (type === "week4") {
      setWeek4Data((prev) => ({
        ...prev,
        reports: prev.reports.map((report) =>
          report.projectId === projectId
            ? { ...report, hours: numValue }
            : report
        ),
      }));
    } else if (type === "actual") {
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
    }
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

  if (!projects.length) return <Text>Loading...</Text>;

  const handleSubmission = async () => {
    try {
      await axios.post("/project/submitWeeklyReport", {
        actualWeeklyReports: actualWeekReports,
        week4Data,
      });
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
    <Container maxW="16xl" p={4} height="100vh">
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
                <Th width="200px" bg="gray.50">
                  Project
                </Th>
                <Th width="100px" bg="gray.50">
                  Category
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
                  <Badge colorScheme="purple">{week0.availableHours} hrs</Badge>
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
                <Th width="100px" bg="purple.50">
                  Week 4<br />
                  {week4Data.startDate
                    ? formatDate(week4Data.startDate) +
                      " - " +
                      formatDate(week4Data.endDate)
                    : "Future"}
                  <br />
                  <Badge colorScheme="purple">
                    {week4Data.availableHours} hrs
                  </Badge>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {projects.map((project) => (
                <Tr key={project.projectId}>
                  <Td>
                    <Text fontWeight="medium">{project.name}</Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {project.description}
                    </Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        project.category === "Projects" ? "green" : "blue"
                      }
                    >
                      {project.category}
                    </Badge>
                  </Td>
                  <Td bg="yellow.50">
                    <Input
                      type="number"
                      value={getPrevWeekHours(project.projectId, true)}
                      onChange={(e) =>
                        handleChange(
                          project.projectId,
                          e.target.value,
                          "actual"
                        )
                      }
                      size="sm"
                      min="0"
                      max="40"
                      bg="white"
                    />
                  </Td>
                  <Td bg="green.50">{getPrevWeekHours(project.projectId)}</Td>
                  {sortedWeeks.map(([weekId]) => (
                    <Td key={weekId} bg="blue.50">
                      {getHoursForProject(project.projectId, weekId)}
                    </Td>
                  ))}
                  <Td bg="purple.50">
                    <Input
                      type="number"
                      value={getHoursForProject(project.projectId, null, true)}
                      onChange={(e) =>
                        handleChange(project.projectId, e.target.value, "week4")
                      }
                      size="sm"
                      min="0"
                      max="40"
                      bg="white"
                    />
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
                  {prevWeekReports.reduce((sum, r) => sum + (r.hours || 0), 0)}
                </Td>
                {sortedWeeks.map(([weekId]) => (
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
                <Td bg="yellow.50">-</Td>
                <Td bg="green.50">-</Td>
                {sortedWeeks.map(([weekId, week]) => (
                  <Td key={weekId} bg="blue.50">
                    {calculateCapacity(weeklyReports[weekId])}%
                  </Td>
                ))}
                <Td bg="purple.50">
                  {week4Data.availableHours ? calculateCapacity(week4Data) : 0}%
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
        <Box mt={4}>
          <Button
            colorScheme="teal"
            onClick={() => {
              toast({
                title: "Success",
                description: "Reports submitted successfully!",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Submit Weekly Report
          </Button>
        </Box>
      </Flex>
      <AddProject />
    </Container>
  );
};

export default Dashboard;
