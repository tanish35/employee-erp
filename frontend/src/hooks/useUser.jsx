import axios from "axios";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [loadingUser, setLoadingUser] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  async function getDetails() {
    try {
      const res = await axios.get("/employee/me", {
        withCredentials: true,
      });
      setUserDetails(res.data);
      setLoadingUser(false);
    } catch (err) {
      console.log(err);
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    getDetails();
  }, []); // Empty dependency array, so it runs only once on component mount

  useEffect(() => {
    if (userDetails) {
      // console.log("User details:", userDetails);
    }
  }, [userDetails]); // Log userDetails whenever it changes

  return { loadingUser, userDetails };
};
