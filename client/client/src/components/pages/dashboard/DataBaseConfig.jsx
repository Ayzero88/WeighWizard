import React, { useEffect, useState } from 'react'
import { FaArrowRight, FaLink } from 'react-icons/fa';

const DataBaseConfig = () => {
    const [dbParams, setDbParams] = useState({
        user: '',
        host: '',
        database: '',
        password: '',
        port: ''
  
    });
    const [status, setStatus] = useState("");

    const handleSet = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/db-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dbParams),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
    
            // Ensure data.message exists before alerting
            alert(`Response: ${data.message || 'No message received'}`);

        } catch (error) {
            console.log("Error", error);
            alert(`Not Connected`);
        }
    };

    useEffect(() => {
        fetch('http://localhost:5000/db-con-check')
            .then(response => response.json())
            .then(data => {
                setStatus(data.status);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

  return (
    <div className='db-wrap'>
        <div> <FaLink size={20} color={status === 'connected' ? 'lightgreen' : 'gray' }/> 
             <h2>{status === 'connected' ? 'Linked' : 'Check DataBase Link'}</h2>
        </div>
       
        <form>
         
          <input className='submit' type='submit' onClick={handleSet} value="Check"/>
          
        </form>
  
    </div>
  )
};
export default DataBaseConfig;