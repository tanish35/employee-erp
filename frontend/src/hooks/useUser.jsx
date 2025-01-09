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
      // console.log(err);
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    if (userDetails) {
    }
  }, [userDetails]);
  return { loadingUser, userDetails };
};
