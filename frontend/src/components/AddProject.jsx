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
  const [category, setCategory] = useState("Operational");

  const handleSubmit = async () => {
    if (category !== "Removes" && (!projectName || !projectDescription)) {
      alert("All fields are required!");
      return;
    }

    // Initialize local variables for updated hours
    let updatedWeek0Hours = week0Hours || "0";
    let updatedWeek1Hours = week1Hours || "0";
    let updatedWeek2Hours = week2Hours || "0";
    let updatedWeek3Hours = week3Hours || "0";
    let updatedWeek4Hours = week4Hours || "0";
    let updatedWeek0ActualHours = week0ActualHours || "0";

    try {
      const employeeId = userDetails?.id;
      const projectData = {
        projectName: category === "Removes" ? "" : projectName,
        projectDescription: category === "Removes" ? "" : projectDescription,
        week0Hours: updatedWeek0Hours,
        week0ActualHours: updatedWeek0ActualHours,
        week1Hours: updatedWeek1Hours,
        week2Hours: updatedWeek2Hours,
        week3Hours: updatedWeek3Hours,
        week4Hours: updatedWeek4Hours,
        category,
        employeeId,
      };

      if (category !== "Removes") {
        await axios.post("/project/addProjectData", projectData, {
          withCredentials: true,
        });
      } else {
        await axios.post("/project/addLeaveData", projectData, {
          withCredentials: true,
        });
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
        position="relative"
        left={450}
      >
        Add Task
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
              </>
            )}
            <Input
              type="number"
              placeholder={
                category === "Removes"
                  ? "Actual Days - Week 0"
                  : "Actual Hours - Week 0"
              }
              value={week0ActualHours}
              onChange={(e) => setWeek0ActualHours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder={
                category === "Removes"
                  ? "Planned Days - Week 0"
                  : "Planned Hours - Week 0"
              }
              value={week0Hours}
              onChange={(e) => setWeek0Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder={
                category === "Removes"
                  ? "Planned Days - Week 1"
                  : "Planned Hours - Week 1"
              }
              value={week1Hours}
              onChange={(e) => setWeek1Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder={
                category === "Removes"
                  ? "Planned Days - Week 2"
                  : "Planned Hours - Week 2"
              }
              value={week2Hours}
              onChange={(e) => setWeek2Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder={
                category === "Removes"
                  ? "Planned Days - Week 3"
                  : "Planned Hours - Week 3"
              }
              value={week3Hours}
              onChange={(e) => setWeek3Hours(e.target.value)}
              mb={3}
            />
            <Input
              type="number"
              placeholder={
                category === "Removes"
                  ? "Planned Days - Week 4"
                  : "Planned Hours - Week 4"
              }
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
