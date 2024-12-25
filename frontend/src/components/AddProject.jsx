// AddProject.js
import { useState } from "react";
import { useUser } from "../hooks/useUser";
import axios from "axios";
import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
} from "@chakra-ui/react";

const AddProject = () => {
  const { loadingUser, userDetails } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [week1Hours, setWeek1Hours] = useState("");
  const [week2Hours, setWeek2Hours] = useState("");
  const [week3Hours, setWeek3Hours] = useState("");
  const [week4Hours, setWeek4Hours] = useState("");
  const [category, setCategory] = useState("Operational"); // Default category

  const handleSubmit = async () => {
    if (
      !projectName ||
      !projectDescription ||
      !week1Hours ||
      !week2Hours ||
      !week3Hours ||
      !week4Hours ||
      !category
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      const employeeId = userDetails?.id;
      const projectData = {
        projectName,
        projectDescription,
        week1Hours,
        week2Hours,
        week3Hours,
        week4Hours,
        category,
        employeeId,
      };

      const response = await axios.post("/projects/add", projectData, {
        withCredentials: true,
      });
      if (response.status === 200) {
        alert("Project added successfully!");
        onClose(); // Close the modal after successful submission
      } else {
        alert("Failed to add project");
      }
    } catch (err) {
      console.error("Error adding project:", err);
      alert("Error adding project");
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="blue"
        position="fixed"
        bottom="20px"
        right="20px"
      >
        Add Project
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Project</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              mb={3}
            />
            <Textarea
              placeholder="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder="Planned Hours - Week 1"
              value={week1Hours}
              onChange={(e) => setWeek1Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder="Planned Hours - Week 2"
              value={week2Hours}
              onChange={(e) => setWeek2Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder="Planned Hours - Week 3"
              value={week3Hours}
              onChange={(e) => setWeek3Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder="Planned Hours - Week 4"
              value={week4Hours}
              onChange={(e) => setWeek4Hours(e.target.value)}
              mb={3}
            />
            {/* Category Dropdown */}
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              mb={3}
            >
              <option value="Operational">Operational</option>
              <option value="Projects">Projects</option>
              <option value="Strategic">Strategic</option>
              <option value="Others">Others</option>
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Save Project
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddProject;
