import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Grid,
  Text,
  Flex,
  Badge,
  Tooltip,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import {
  FaCode,
  FaPaintBrush,
  FaBullhorn,
  FaChartLine,
  FaQuestionCircle,
  FaGlobe,
  FaEllipsisH,
} from "react-icons/fa";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case "operational":
      return FaCode;
    case "projects":
      return FaPaintBrush;
    case "strategic":
      return FaBullhorn;
    case "roadmap":
      return FaChartLine;
    case "all":
      return FaGlobe; 
    case "others":
      return FaEllipsisH; 
    default:
      return FaQuestionCircle;
  }
};



const ProjectHistoryPage = () => {
  const [startDate, setStartDate] = useState(new Date("2024-12-16"));
  const [endDate, setEndDate] = useState(new Date("2025-01-04"));
  const [historyData, setHistoryData] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.800");

  const fetchHistory = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Date selection required",
        description: "Please select both start and end dates.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedCategory("All");
    setIsLoading(true);
    try {
      const response = await axios.get("/history/getHistory", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        withCredentials: true,
      });
      setHistoryData(response.data.historyData);
      setCategoryData(response.data.categoryData);
      console.log(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch history data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  function getCategoryColor(category) {
    const colorMap = {
      Projects: "blue",
      Roadmap: "purple",
      Operational: "green",
      operational: "green",
      Strategic: "teal",
      All:"cyan",
      Others: "orange",
    };
    return colorMap[category] || "gray";
  }

  function getCapacityColor(capacity) {
    if (capacity < 50) return "red";
    if (capacity < 75) return "yellow";
    return "green";
  }

  const filteredHistoryData = selectedCategory!== "All"
  ? historyData.map((week) => ({
      ...week,
      projectData: week.projectData.filter(
        (project) => project.projectCategory === selectedCategory
      ),
    }))
  : historyData;


  const CategoryCard = ({ category, hours, color }) => {
  const bgColor = useColorModeValue(`${color}.100`, `${color}.700`);
  const textColor = useColorModeValue(`${color}.700`, `${color}.100`);
  const IconComponent = getCategoryIcon(category);

  return (
    <MotionBox whileHover={{ y: -2 }} transition={{ duration: 0.2 }} onClick={()=>setSelectedCategory(category)}>
      <Flex
        bg={bgColor}
        color={textColor}
        borderRadius="md"
        p={3}
        alignItems="center"
        justifyContent="space-between"
        boxShadow="sm"
        width="100%"
      >
        <Flex alignItems="center">
          <Box as={IconComponent} mr={2} />
          <Text fontWeight="medium" fontSize="sm" p={1}>
            {category}
          </Text>
        </Flex>
        <Text fontWeight="bold" fontSize="sm">
          {hours}h
        </Text>
      </Flex>
    </MotionBox>
  );
};


  useEffect(() => {
    console.log(selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <Image
        src="polycab1.png"
        alt="Polycab Logo"
        width="300px"
        height="200px"
        mt={-50}
        ml={-10}
      />
      <Box
        position="relative"
        top={-50}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="2xl"
        p={4}
        ml={350}
        maxWidth={800}
        borderRadius="2xl"
        zIndex={10}
      >
        <Heading as="h2" size="sm" mb={6} textAlign="center">
          Hours Worked by Category
        </Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={3}>
          {Object.entries(categoryData).map(([category, hours]) => (
            <CategoryCard
              key={category}
              category={category}
              hours={hours}
              color={getCategoryColor(category)}
            />
          ))}
        </Grid>
      </Box>

      <Flex
        direction="column"
        bg={bgColor}
        minH="100vh"
        minWidth="100vw"
        py={8}
        alignItems="center"
      >
        <Container maxW="container.md">
          <VStack spacing={8} align="center" position="relative" top={-250}>
            <Heading as="h1" size="xl" textAlign="center" mt={-50}>
              History
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8} mt={200}>
              <DatePickerCard
                label="Start Date"
                selected={startDate}
                onChange={setStartDate}
                maxDate={endDate}
              />
              <DatePickerCard
                label="End Date"
                selected={endDate}
                onChange={setEndDate}
                minDate={startDate}
              />
            </Grid>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={fetchHistory}
              isLoading={isLoading}
              leftIcon={<Calendar />}
            >
              Fetch History
            </Button>
            {filteredHistoryData.length > 0 && (
              <Box
                overflowX="auto"
                boxShadow="lg"
                borderRadius="lg"
                borderWidth={1}
                borderColor="gray.200"
                p={4}
                bg="white"
              >
                <Table variant="striped" size="md">
                  <Thead>
                    <Tr bg="gray.100">
                      <Th textAlign="center">Category</Th>
                      <Th textAlign="center">Project Name</Th>
                      {filteredHistoryData.map((week) => (
                        <Th key={week.weekId} textAlign="center" minW={200}>
                          <Text fontSize="sm" fontWeight="bold">
                            {new Date(week.startDate).toLocaleDateString(
                              "en-GB"
                            )}{" "}
                            -{" "}
                            {new Date(week.endDate).toLocaleDateString("en-GB")}
                          </Text>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredHistoryData[0].projectData.map((project) => (
                      <Tr key={project.projectId} _hover={{ bg: "gray.50" }}>
                        <Td textAlign="center">
                          <Badge
                            colorScheme={getCategoryColor(
                              project.projectCategory
                            )}
                          >
                            {project.projectCategory}
                          </Badge>
                        </Td>
                        <Td fontWeight="bold" minW="300px">
                          {project.projectName}
                          <Box display="flex">
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              maxW="200px"
                              noOfLines={3}
                              title={project.projectDescription}
                            >
                              {project.projectDescription
                                ? project.projectDescription
                                : "No description available"}
                            </Text>
                          </Box>
                        </Td>

                        {filteredHistoryData.map((week) => {
                          const projectWeekData = week.projectData.find(
                            (data) => data.projectId === project.projectId
                          );
                          return (
                            <Td key={week.weekId} textAlign="center">
                              <Text fontSize="sm" fontWeight="medium">
                                {projectWeekData?.projectHours || 0}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Hours
                              </Text>
                            </Td>
                          );
                        })}
                      </Tr>
                    ))}
                    <Tr bg="gray.100">
                      <Td colSpan={2} fontWeight="bold" textAlign="center">
                        Week Summary
                      </Td>
                      {filteredHistoryData.map((week) => (
                        <Td key={week.weekId}>
                          <VStack align="start" spacing={1}>
                            <Tooltip
                              label="Total Project Hours"
                              placement="top"
                            >
                              <Text fontSize="sm">
                                Total: {week.totalProjectHours}h
                              </Text>
                            </Tooltip>
                            <Tooltip label="Total Leave Hours" placement="top">
                              <Text fontSize="sm" color="orange.500">
                                Leaves: {week.totalLeaveHours}h
                              </Text>
                            </Tooltip>
                            <Tooltip
                              label="Total Effective Hours"
                              placement="top"
                            >
                              <Text fontSize="sm" color="green.500">
                                Effective: {week.totalEffectiveHours}h
                              </Text>
                            </Tooltip>
                            <Tooltip label="Capacity Used" placement="top">
                              <Text fontSize="sm" fontWeight="bold">
                                Capacity:{" "}
                                <Badge
                                  colorScheme={getCapacityColor(
                                    week.capacityUsed
                                  )}
                                  fontSize="sm"
                                >
                                  {week.capacityUsed}%
                                </Badge>
                              </Text>
                            </Tooltip>
                          </VStack>
                        </Td>
                      ))}
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </Container>
      </Flex>
    </>
  );
};

const DatePickerCard = ({ label, selected, onChange, minDate, maxDate }) => {
  const cardBgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      bg={cardBgColor}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
      p={4}
      boxShadow="md"
    >
      <Text fontWeight="bold" mb={2}>
        {label}:
      </Text>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy/MM/dd"
        minDate={minDate}
        maxDate={maxDate}
        showPopperArrow={false}
        customInput={
          <Button variant="outline" width="100%">
            {selected ? selected.toLocaleDateString() : "Select date"}
          </Button>
        }
      />
    </Box>
  );
};

export default ProjectHistoryPage;
