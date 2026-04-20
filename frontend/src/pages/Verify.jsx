import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "../Loading";
import { server } from "../main.jsx";


const Verify = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  

  async function verifyUser() {
    try {
      // const token = params.token;
      // const response = await fetch(`${server}/api/v1/users/verify-email/${token}`);
      // const data = await response.json();
      // if (data.success) {
      //   setSuccessMessage(data.message);
      // } else {
      //   setErrorMessage(data.message);
      // }
      const { data } =  await axios.post(
        `${server}/api/v1/users/verify/${params.token}`,
      );

      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage( error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    verifyUser();
  },[])
  
  return (
    <>
    {/* <p>Verification is on</p> */}
      {loading? (
        <Loading />
      ) : (
        <div className="w-full m-auto flex justify-center items-center h-screen">
          { successMessage && (
            <p className="text-green-500">{successMessage}</p>
            )}
            { errorMessage && (
            <p className="text-red-500">{errorMessage}</p>
            )}
        </div>
      )}
    </>
  );
};

export default Verify;
