import React, { useState, useEffect, useRef } from "react";
import { Box, Select, Text } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { gsap } from "gsap";
import axios from "axios";

const StylishDropdown = ({ selectedEmployee, onEmployeeChange }) => {
  const [subordinates, setSubordinates] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchSubordinates();
    // animateDropdown();
  }, []);

  const fetchSubordinates = async () => {
    try {
      const response = await axios.get("/employee/subordinates", {
        withCredentials: true,
      });

      setSubordinates(response.data.managing || []);
    } catch (error) {
      console.error("Error fetching subordinates:", error);
    }
  };

  //   const animateDropdown = () => {
  //     gsap.from(dropdownRef.current, {
  //       y: -20,
  //       opacity: 0,
  //       duration: 0.5,
  //       ease: "power3.out",
  //     });
  //   };

  const handleChange = (event) => {
    onEmployeeChange(event.target.value);
  };

  return (
    <Box ref={dropdownRef} position="relative" width="350px">
      <Select
        value={selectedEmployee}
        onChange={handleChange}
        bg="white"
        borderColor="purple.500"
        borderWidth="2px"
        borderRadius="md"
        mt={6}
        ml={6}
        p={2}
        _hover={{ borderColor: "purple.600" }}
        _focus={{ borderColor: "purple.700", boxShadow: "outline" }}
        icon={<ChevronDownIcon color="purple.500" />}
      >
        <option value="me">Me</option>
        {subordinates.map((subordinate) => (
          <option key={subordinate.employeeId} value={subordinate.employeeId}>
            {subordinate.name}
          </option>
        ))}
      </Select>
      <Text
        position="absolute"
        top="-10px"
        left="10px"
        bg="white"
        px="2"
        mt={4}
        fontSize="sm"
        color="purple.500"
        fontWeight="medium"
      >
        Select Employee
      </Text>
    </Box>
  );
};

export default StylishDropdown;
