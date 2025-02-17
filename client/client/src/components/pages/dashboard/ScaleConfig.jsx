import React, { useEffect, useState } from 'react'
import { FaLink } from 'react-icons/fa';

const ScaleConfig = () => {

  const [status, setStatus] = useState("");
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
 
     const handleSet = async (e) => {
         e.preventDefault();
         try {
             const response = await fetch('http://localhost:5000/scale-config', {
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
     
         } catch (error) {
             console.error("Failed to send scale params", error);
             alert(`Failed to send scale params. Check database connection.`);
         }
     };

       useEffect(() => {
             fetch('http://localhost:5000/scale-con-check')
                 .then(response => response.json())
                 .then(data => {
                    setStatus(data.status);
                    setScaleParams({
                        port: data.scaleParams.port,
                        baudRate: data.scaleParams.baud_rate,
                        dataBits: data.scaleParams.databits,
                        stopBits: data.scaleParams.stopbits,
                        parity: data.scaleParams.parity,
                        flowControl: data.scaleParams.flow_control,
                    });
                 })
                 .catch(error => console.error('Error fetching data:', error));
         }, []);
     
 
   return (
     <div className='db-wrap'>
          <div> <FaLink size={20} color={status === 'saved' ? 'lightgreen' : 'gray' }/> 
                      <h2>{status === 'saved' ? 'Saved' : 'Save Configuration'}</h2>
            </div>
        
         <form>
            <input type='text' onChange={handleInputChange} value={scaleParams.port} placeholder='Port' name='port'  autoComplete='off'/>
           <input type='number' onChange={handleInputChange} value={scaleParams.baudRate} placeholder='BaudRate' name='baudRate' autoComplete='off'/>
           <input type='number' onChange={handleInputChange} value={scaleParams.dataBits} placeholder='DataBits' name='dataBits' autoComplete='off'/>
           <input type='number' onChange={handleInputChange} value={scaleParams.stopBits} placeholder='StopBits' name='stopBits' autoComplete='off'/>
           <input type='text' onChange={handleInputChange} value={scaleParams.parity} placeholder='Parity' name='parity' autoComplete='off'/>
           <input type='text' onChange={handleInputChange} value={scaleParams.flowControl} placeholder='FlowControl' name='flowControl' autoComplete='off'/>
           {!status && <input className='submit' type='submit' onClick={handleSet} value="Save Parameter"/>}
           
         </form>
   
     </div>
   )
}

export default ScaleConfig;