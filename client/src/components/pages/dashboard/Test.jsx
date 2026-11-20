import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaDumpster, FaWeight } from 'react-icons/fa';
import Btn from '../../reuse/Btn';
import { FiPlay, FiStopCircle } from 'react-icons/fi';
import useWebSocket from './ManageWS';
import { BaseUrl, WsUrl } from '../../reuse/BaseUrl';

const weightColor = (w) => {
  if (!w) return "gray";
  if (
    w.includes("Error") ||
    w.includes("not connected") ||
    w.startsWith("Available Ports") ||
    w === "Disconnected" ||
    w === "No serial ports detected"
  ) return "pink";
  if (w === "Overload") return "orange";
  return "lightgreen";
};


const Test = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [scaleConfig, setScaleConfig] = useState(null);
  const [enabledScales, setEnabledScales] = useState(['GATE_1']);

  // Fetch the enabled scales, then each one's capacity & resolution ONCE
useEffect(() => {
    const load = async (scaleId) => {
          const res = await axios.get(`${BaseUrl}/print-type`, { params: { scaleId } });
          const d = res.data;
          return { capacity: d.capacity, resolution: d.resolution };
    };
    axios.get(`${BaseUrl}/scale`)
      .then(async res => {
        const configs = res.data;
        const enabled = (Array.isArray(configs) ? configs : [])
          .filter(c => c.enabled)
          .map(c => c.scaleId)
          .sort();
        const ids = enabled.length ? enabled : ['GATE_1'];
        setEnabledScales(ids);
        const entries = await Promise.all(ids.map(async id => [id, await load(id)]));
        setScaleConfig(Object.fromEntries(entries));
      })
      .catch(err => console.error(err));
}, []);

  // 🔹 Pass DB values into WebSocket hook
  const { weights, stop = () => {} } = useWebSocket({
    url: isRunning && scaleConfig ? WsUrl : null,
    configs: scaleConfig
  });


  const handleStart = () => {
    if (!scaleConfig) return console.warn("Scale config not ready yet");
    setIsRunning(true);
  };

  const handleStop = () => {
    stop();
    setIsRunning(false);
  };

  const multiScale = enabledScales.length > 1;

  return (
    <div className='test-wrap'>
      <h2>
        <FaDumpster color='gray' /> Dump Site
      </h2>

      <div className='dump-site' style={{ display: 'flex', gap: '2rem' }}>
        {enabledScales.map(id => (
          <div key={id}>
            <h3 style={{color: "white", marginBottom: "1rem"}}>Scale {multiScale ? id.replace('GATE_', '') : ''}</h3>
            <h2 style={{ color: weightColor(weights[id]) }}>
              <FaWeight /> {weights[id] || "--"}
            </h2>
          </div>
        ))}
      </div>

      <div className='btn'>
        <Btn
          btnName="Start"
          handleClick={handleStart}
          pt="1rem" pb="1rem" pl="1rem" pr="1rem"
          col="#fff" bgc="#b08d57" gp="0.5rem" wt="10rem"
          bd="none" bdr="5px" fs="1rem"
          icon={<FiPlay />}
        />
        <Btn
          btnName="Stop"
          handleClick={handleStop}
          p="1rem" fs="1rem"
          col="#fff" bgc="#b08d57" gp="0.5rem" wt="10rem"
          bd="none" bdr="5px"
          icon={<FiStopCircle />}
        />
      </div>
    </div>
  );
};

export default Test;
