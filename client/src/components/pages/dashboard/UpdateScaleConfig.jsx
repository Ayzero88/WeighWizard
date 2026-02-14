import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowUp} from 'react-icons/fa';
const UpdateScaleConfig = () => {
   const [scaleParams, setScaleParams] = useState({
          port: '',
          baudRate: '',
          databits: '',
          stopbits: '',
          parity: '',
          flowControl: ''
    
      });

      const [paramId, setParamId] = useState(2);
 
      const handleInputChange = (e)=>{
          const {name, value} = e.target;
          setScaleParams({...scaleParams, [name]: value});
      };
  
const handleUpdate = async (e) => {
    e.preventDefault();

    if (!paramId) {
        alert("No scale configuration selected to update.");
        return;
    }

    try {
        const response = await axios.put(`http://localhost:8080/scale/${paramId}`, scaleParams);

        // Axios automatically parses JSON, so no need for response.json()
        alert("Configuration updated successfully!");

        // Reset the form
        setScaleParams({
            port: '',
            baudRate: '',
            databits: '',
            stopbits: '',
            parity: '',
            flowControl: ''
        });
        setParamId(null); // reset current config id

    } catch (error) {
        console.error("Failed to update scale params", error);
        if (error.response) {
            // Server responded with a status other than 2xx
            alert(`Update failed: ${error.response.status} - ${error.response.data}`);
        } else {
            alert("Failed to update scale parameters. Check database connection.");
        }
    }
};

useEffect(() => {
        axios.get('http://localhost:8080/scale')
        .then(res => {
            if (res.data.length > 0) {
            const config = res.data[0];
            setParamId(config.id);
            setScaleParams({
                port: config.port,
                baudRate: config.baudRate,
                databits: config.databits,
                stopbits: config.stopbits,
                parity: config.parity,
                flowControl: config.flowControl
            });
            } 
      })
      .catch(err => console.error(err));
  }, []);

    return (
      <div className='db-wrap'> 
          <h2><FaArrowUp color='gray'/> Update Scale Parameters</h2>
          <form>
             <input type='text' onChange={handleInputChange} value={scaleParams.port} placeholder='Port' name='port'  autoComplete='off'/>
            <input type='number' onChange={handleInputChange} value={scaleParams.baudRate} placeholder='Baud Rate' name='baudRate' autoComplete='off'/>
            <input type='number' onChange={handleInputChange} value={parseInt(scaleParams.databits)} placeholder='DataBits' name='databits' autoComplete='off'/>
            <input type='number' onChange={handleInputChange} value={parseInt(scaleParams.stopbits)} placeholder='StopBits' name='stopbits' autoComplete='off'/>
            <input type='text' onChange={handleInputChange} value={scaleParams.parity} placeholder='Parity' name='parity' autoComplete='off'/>
            <input type='text' onChange={handleInputChange} value={scaleParams.flowControl} placeholder='Flow Control' name='flowControl' autoComplete='off'/>
            <input className='submit' type='submit' onClick={handleUpdate} value="Update Parameter"/>
            
          </form>
    
      </div>
    )
}

export default UpdateScaleConfig