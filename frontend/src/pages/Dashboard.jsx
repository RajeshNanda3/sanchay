import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../apiInterceptor'

const Dashboard = () => {
  const [content, setContent]= useState("")
  async function fetchAdminData(){
    try {
      const {data}= await api.get(`/api/v1/users/admin`,{
        withCredentials:true,
      })

      setContent(data.message)
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  useEffect(()=>{
    fetchAdminData()
  },[])
  return <>{content && <div>{content}</div>}</>
}

export default Dashboard