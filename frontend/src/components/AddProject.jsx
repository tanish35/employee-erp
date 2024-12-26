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
  const [week0Hours, setWeek0Hours] = useState("");
  const [week0ActualHours, setWeek0ActualHours] = useState("");
  const [category, setCategory] = useState("Operational"); // Default category

  const handleSubmit = async () => {
    if (category !== "Removes" && (!projectName || !projectDescription)) {
      alert("All fields are required!");
      return;
    }
    if (
      !week1Hours ||
      !week2Hours ||
      !week3Hours ||
      !week4Hours ||
      !week0Hours
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      const employeeId = userDetails?.id;
      const projectData = {
        projectName: category === "Removes" ? "" : projectName,
        projectDescription: category === "Removes" ? "" : projectDescription,
        week0Hours,
        week0ActualHours: category === "Removes" ? "" : week0ActualHours,
        week1Hours,
        week2Hours,
        week3Hours,
        week4Hours,
        category,
        employeeId,
      };
      if (category !== "Removes") {
        const response = await axios.post(
          "/project/addProjectData",
          projectData,
          {
            withCredentials: true,
          }
        );
      } else {
        const response = await axios.post(
          "/project/addLeaveData",
          projectData,
          {
            withCredentials: true,
          }
        );
      }
      onClose();
      alert("Project added successfully!");
      window.location.reload();
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
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              mb={3}
            >
              <option value="Operational">Operational</option>
              <option value="Projects">Projects</option>
              <option value="Strategic">Strategic</option>
              <option value="Roadmap">Roadmap</option>
              <option value="Removes">Leaves</option>
              <option value="Others">Others</option>
            </Select>

            {category !== "Removes" && (
              <>
                {category === "Roadmap" ? (
                  <Select
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    mb={3}
                  >
                    <option value="A">Project A</option>
                    <option value="B">Project B</option>
                    <option value="C">Project C</option>
                    <option value="D">Project D</option>
                  </Select>
                ) : (
                  <Input
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    mb={3}
                  />
                )}
                <Textarea
                  placeholder="Activity Description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  mb={3}
                />
                <Input
                  type="number"
                  placeholder="Actual Hours - Week 0"
                  value={week0ActualHours}
                  onChange={(e) => setWeek0ActualHours(e.target.value)}
                  mb={3}
                />
              </>
            )}

            <Input
              type="number"
              placeholder="Planned Hours - Week 0"
              value={week0Hours}
              onChange={(e) => setWeek0Hours(e.target.value)}
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
