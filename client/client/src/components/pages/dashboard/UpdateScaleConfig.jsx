import React, { useState } from 'react';
import { FaArrowUp} from 'react-icons/fa';
const UpdateScaleConfig = () => {
   const [scaleParams, setScaleParams] = useState({
          port: '',
          baudRate: '',
          dataBits: '',
          stopBits: '',
          parity: '',
          flowControl: ''
    
      });
 
      const handleInputChange = (e)=>{
          const {name, value} = e.target;
          setScaleParams({...scaleParams, [name]: value});
      };
  
      const handleUpdate = async (e) => {
          e.preventDefault();
          try {
              const response = await fetch('http://localhost:5000/update-scale-config', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(scaleParams),
              });
      
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              };
      
              const data = await response.json();
      
              // Ensure data.message exists before alerting
              alert(`Response: ${data.message || 'No message received'}`);

             setScaleParams( {
                port: '',
                baudRate: '',
                dataBits: '',
                stopBits: '',
                parity: '',
                flowControl: ''
          
            });
          } catch (error) {
              console.error("Failed to send scale params", error);
              alert(`Failed to update scale params. Check database connection.`);
          }
      };
  
    return (
      <div className='db-wrap'> 
          <h2><FaArrowUp color='gray'/> Update Scale Parameters</h2>
          <form>
             <input type='text' onChange={handleInputChange} value={scaleParams.port} placeholder='Port' name='port'  autoComplete='off'/>
            <input type='number' onChange={handleInputChange} value={scaleParams.baudRate} placeholder='BaudRate' name='baudRate' autoComplete='off'/>
            <input type='number' onChange={handleInputChange} value={scaleParams.dataBits} placeholder='DataBits' name='dataBits' autoComplete='off'/>
            <input type='number' onChange={handleInputChange} value={scaleParams.stopBits} placeholder='StopBits' name='stopBits' autoComplete='off'/>
            <input type='text' onChange={handleInputChange} value={scaleParams.parity} placeholder='Parity' name='parity' autoComplete='off'/>
            <input type='text' onChange={handleInputChange} value={scaleParams.flowControl} placeholder='FlowControl' name='flowControl' autoComplete='off'/>
            <input className='submit' type='submit' onClick={handleUpdate} value="Update Parameter"/>
            
          </form>
    
      </div>
    )
}

export default UpdateScaleConfig