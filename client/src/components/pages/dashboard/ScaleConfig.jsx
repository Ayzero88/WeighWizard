import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaLink } from 'react-icons/fa';

const ScaleConfig = () => {

  const [status, setStatus] = useState("");
  const [scaleParams, setScaleParams] = useState({
         port: '',
         baudRate: '',
         databits: '',
         stopbits: '',
         parity: '',
         flowControl: ''
   
     });

     const [paramId, setParamId] = useState(null);

     const handleInputChange = (e)=>{
         const {name, value} = e.target;
         setScaleParams({...scaleParams, [name]: value});
     };

      // Save or update config
  const handleSet = async (e) => {
    e.preventDefault();
    try {
      if (paramId) {
        // Update existing
        const res = await axios.put(`http://localhost:8080/scale/${paramId}`, scaleParams);
        alert('Scale parameters updated!');
      } else {
        // Create new
        const res = await axios.post('http://localhost:8080/scale', scaleParams);
        setParamId(res.data.id);
        alert('Scale parameters saved!');
      }
      setStatus('saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save scale parameters.');
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
                setStatus('saved');
            } else {
                setStatus('not saved');
            }
      })
      .catch(err => console.error(err));
  }, []);
     
       
   return (
     <div className='db-wrap'>
          <div> <FaLink size={20} color={status === 'saved' ? 'lightgreen' : 'gray' }/> 
                      <h2>{status === 'saved' ? 'Saved' : 'Save Configuration'}</h2>
            </div>
        
         <form>
            <input type='text' onChange={handleInputChange} value={scaleParams.port} placeholder='Port' name='port'  autoComplete='off'/>
           <input type='number' onChange={handleInputChange} value={scaleParams.baudRate} placeholder='Baud Rate' name='baudRate' autoComplete='off'/>
           <input type='number' onChange={handleInputChange} value={parseInt(scaleParams.databits)} placeholder='Databits' name='databits' autoComplete='off'/>
           <input type='number' onChange={handleInputChange} value={parseInt(scaleParams.stopbits)} placeholder='Stopbits' name='stopbits' autoComplete='off'/>
           <input type='text' onChange={handleInputChange} value={scaleParams.parity} placeholder='Parity' name='parity' autoComplete='off'/>
           <input type='text' onChange={handleInputChange} value={scaleParams.flowControl} placeholder='Flow Control' name='flowControl' autoComplete='off'/>
           {(status !== 'saved') && <input className='submit' type='submit' onClick={handleSet} value="Save Parameter"/>}
           
         </form>
   
     </div>
   )
}

export default ScaleConfig;