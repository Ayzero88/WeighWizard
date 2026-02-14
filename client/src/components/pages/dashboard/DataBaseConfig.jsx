import React, { useEffect, useState } from 'react'
import {FaLink } from 'react-icons/fa';
import axios from 'axios';

const DataBaseConfig = () => {

    const [status, setStatus] = useState("");



    useEffect(() => {
        const fetchDbStatus = async () => {
            try {
            const response = await axios.get('http://localhost:8080/db-con-check');
            setStatus(response.data.status); // Axios already parses JSON
            } catch (error) {
            console.error('Error fetching data:', error.response?.data || error.message);
            }
  };

  fetchDbStatus();
}, []);

  return (
    <div className='db-wrap'>
        <div> <FaLink size={20} color={status === 'connected' ? 'lightgreen' : 'gray' }/> 
             <h2>{status === 'connected' ? 'Linked' : 'Check DataBase Link'}</h2>
        </div>
    </div>
  )
};
export default DataBaseConfig;