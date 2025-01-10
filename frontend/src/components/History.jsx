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
  GridItem,
  Text,
  Flex,
  Badge,
  Tooltip,
  useColorModeValue,
  Image,
  HStack,
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";

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

  const downloadPDF = () => {
    const element = document.getElementById("history-content");

    html2canvas(element, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate height maintaining aspect ratio

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

      // Save the generated PDF
      pdf.save("history_report.pdf");
    });
  };

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
      // console.log(response.data);
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
      All: "cyan",
      Others: "orange",
    };
    return colorMap[category] || "gray";
  }

  function getCapacityColor(capacity) {
    if (capacity < 50) return "red";
    if (capacity < 75) return "yellow";
    return "green";
  }

  const filteredHistoryData =
    selectedCategory !== "All"
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
      <MotionBox
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={() => setSelectedCategory(category)}
      >
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
    // console.log(selectedCategory);
  }, [selectedCategory]);

  return (
    <Box minH="100vh" overflowX="hidden" id="history-content">
      <Container maxW="100vw" px={4}>
        <Flex direction="column" minH="100vh">
          <Flex
            align="center"
            py={4}
            minW="100vw"
            flexWrap="wrap"
            position="relative"
            top="-50px"
          >
            <Image
              src="polycab1.png"
              alt="Polycab Logo"
              width={{ base: "300px", md: "300px" }}
              height="auto"
            />
            <Heading
              as="h1"
              size="xl"
              position="relative"
              left={450}
              textAlign={{ base: "center", md: "left" }}
            >
              History
            </Heading>
          </Flex>
          <Grid
            templateColumns={{ base: "1fr", lg: "300px 1fr" }}
            // gap={4}
            alignItems="flex-start"
          >
            <Box
              bg={useColorModeValue("white", "gray.700")}
              boxShadow="md"
              p={4}
              borderRadius="lg"
              height="fit-content"
              position="relative"
              top={-10}
              maxW={{ base: "200px", lg: "200px" }}
              overflowX="hidden"
            >
              <Grid
                templateColumns={{ base: "1fr", md: "1fr" }}
                gap={5}
                alignItems="center"
                justifyContent="center"
              >
                <DatePickerCard
                  label="Start Date"
                  selected={startDate}
                  onChange={setStartDate}
                  maxDate={endDate}
                  maxW={150}
                />
                <DatePickerCard
                  label="End Date"
                  selected={endDate}
                  onChange={setEndDate}
                  minDate={startDate}
                  maxW={150}
                />
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={fetchHistory}
                  isLoading={isLoading}
                  leftIcon={<Calendar />}
                  maxW={200}
                >
                  Fetch History
                </Button>
                {historyData.length > 0 && (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={downloadPDF}
                    mb={4}
                    maxW={300}
                    leftIcon={<Calendar />}
                    position="relative"
                  >
                    Download PDF
                  </Button>
                )}
              </Grid>
            </Box>

            <Box position="relative" left={-70}>
              <Box position="relative" left={0}>
                <Box position="relative" left={-16}>
                  <Grid
                    templateRows="auto 1fr"
                    templateColumns="repeat(5, 1fr)"
                    gap={2}
                    mb={4}
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    left={50}
                    top={-20}
                    maxW="100%"
                  >
                    <GridItem colSpan={5} textAlign="center">
                      {" "}
                      {/* Span all columns for the heading */}
                      <Heading
                        as="h2"
                        size="sm"
                        mb={4}
                        position="relative"
                        left={5}
                      >
                        Hours Worked by Category
                      </Heading>
                    </GridItem>
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
              </Box>

              {filteredHistoryData.length > 0 && (
                <Box
                  overflowX="auto"
                  boxShadow="lg"
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="gray.200"
                  p={4}
                  bg="white"
                  position="relative"
                  top={-20}
                >
                  <Table variant="striped" size="sm">
                    <Thead>
                      <Tr
                      // bg="gray.100"
                      // border="2px solid gray"
                      // borderRadius="md"
                      >
                        <Td
                          colSpan={2}
                          fontWeight="bold"
                          textAlign="center"
                          // borderRight="2px solid gray"
                        >
                          {/* Week Summary */}
                        </Td>
                        {filteredHistoryData.map((week) => (
                          <Td
                            key={week.weekId}
                            maxW={10}
                            position="relative"
                            left={10}
                            // borderRight="2px solid gray"
                          >
                            <VStack align="start" spacing={1}>
                              <Tooltip label="Capacity Used" placement="top">
                                <Text fontSize="xs" fontWeight="bold">
                                  Capacity: <br></br>
                                  <Badge
                                    colorScheme={getCapacityColor(
                                      Math.round(week.capacityUsed)
                                    )}
                                    fontSize="xs"
                                  >
                                    {Math.round(week.capacityUsed)}%
                                  </Badge>
                                </Text>
                              </Tooltip>
                              <Tooltip
                                label="Total Project Hours"
                                placement="top"
                              >
                                <Text fontSize="xs">
                                  Total: {week.totalProjectHours}h
                                </Text>
                              </Tooltip>
                              <Tooltip
                                label="Total Effective Hours"
                                placement="top"
                              >
                                <Text fontSize="xs" color="green.500">
                                  Effective: {week.totalEffectiveHours}h
                                </Text>
                              </Tooltip>
                              <Tooltip
                                label="Total Leave Hours"
                                placement="top"
                              >
                                <Text fontSize="xs" color="orange.500">
                                  Leaves: {week.totalLeaveHours / 7 + " days"}
                                </Text>
                              </Tooltip>
                            </VStack>
                          </Td>
                        ))}
                      </Tr>
                      <Tr bg="gray.100">
                        <Th textAlign="center" w={30}>
                          Category
                        </Th>
                        <Th textAlign="center" w={10}>
                          Project Name
                        </Th>
                        {filteredHistoryData.map((week) => (
                          <Th key={week.weekId} textAlign="center" w="0px">
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              textAlign="center"
                            >
                              {format(new Date(week.startDate), "d MMM")}
                              <br />
                              -
                              <br />
                              {format(new Date(week.endDate), "d MMM")}
                            </Text>
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredHistoryData[0].projectData.map((project) => (
                        <Tr key={project.projectId} _hover={{ bg: "gray.50" }}>
                          <Td textAlign="center" maxW={10}>
                            <Badge
                              colorScheme={getCategoryColor(
                                project.projectCategory
                              )}
                            >
                              {project.projectCategory}
                            </Badge>
                          </Td>
                          <Td fontWeight="bold" w="30px">
                            <Text>{project.projectName}</Text>
                            <Box display="flex">
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                maxW="150px"
                                noOfLines={3}
                                title={project.projectDescription}
                              >
                                {project.projectDescription ||
                                  "No description available"}
                              </Text>
                            </Box>
                          </Td>

                          {filteredHistoryData.map((week) => {
                            const projectWeekData = week.projectData.find(
                              (data) => data.projectId === project.projectId
                            );
                            return (
                              <Td key={week.weekId} textAlign="center" maxW={2}>
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
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </Grid>
        </Flex>
      </Container>
    </Box>
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
      <Text fontWeight="bold" mb={2} fontSize="sm">
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
          <Button variant="outline" width="100%" size="sm">
            {selected ? selected.toLocaleDateString() : "Select date"}
          </Button>
        }
      />
    </Box>
  );
};

export default ProjectHistoryPage;
