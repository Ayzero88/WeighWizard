import React, { useState } from 'react'
import { FaDumpster, FaWeight } from 'react-icons/fa'
import Btn from '../../reuse/Btn'
import { FiPlay, FiStopCircle } from 'react-icons/fi'
import useWebSocket from './ManageWS'

const Test = () => {
  const [isRunning, setIsRunning] = useState(false); // Track whether WebSocket is running
  const [wsInstance, setWsInstance] = useState(null); // Store the WebSocket instance

  // Change WebSocket URL to use port 8080
  const { weight, stop, wsInstance: newWsInstance } = useWebSocket({ url: isRunning ? "ws://localhost:8080" : null });

  const handleStart = () => {
    setIsRunning(true); // Start the WebSocket connection
    setWsInstance(newWsInstance); // Set the new WebSocket instance
  };

  const handleStop = () => {
    
      stop(); // Stop the WebSocket connection
      setIsRunning(false); // Update state to stop WebSocket
      setWsInstance(null); // Clear the WebSocket instance
  };

  return (
    <div className='test-wrap'>
      <h2><FaDumpster color='gray'/> Dump Site</h2>
      <div className='dump-site'>
        <h2 style={{color: weight ? 'lightgreen' : 'gray'}}> <FaWeight/> Weight Data: {weight || "Not connected"}</h2>
      </div>
      <div className='btn'>
        <Btn 
          btnName="Start" 
          // disabled={isRunning} 
          handleClick={handleStart} 
          pt="1rem" 
          pb="1rem" 
          pl="1rem" 
          pr="1rem" 
          col="#fff" 
          bgc="#b08d57" 
          gp="0.5rem" 
          wt="10rem" 
          bd="none" 
          bdr="5px" 
          fs="1rem" 
          icon={<FiPlay />}
        />
        <Btn 
          btnName="Stop" 
          // disabled={!isRunning} 
          handleClick={handleStop} 
          pt="1rem" 
          pb="1rem" 
          pl="1rem" 
          pr="1rem" 
          col="#fff" 
          bgc="#b08d57" 
          gp="0.5rem" 
          wt="10rem" 
          bd="none" 
          bdr="5px" 
          fs="1rem" 
          icon={<FiStopCircle />}
        />
      </div>
    </div>
  )
}

export default Test;
