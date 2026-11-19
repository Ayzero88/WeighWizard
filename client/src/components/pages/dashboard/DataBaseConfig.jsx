import React, { useEffect, useState } from 'react'
import {FaLink } from 'react-icons/fa';
import axios from 'axios';
import { BaseUrl } from '../../reuse/BaseUrl';

const DataBaseConfig = () => {

    const [status, setStatus] = useState("");



    useEffect(() => {
        const fetchDbStatus = async () => {
            try {
            const response = await axios.get(`${BaseUrl}/db-con-check`);
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