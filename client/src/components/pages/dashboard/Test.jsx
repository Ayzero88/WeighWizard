import React, { useEffect, useState } from 'react';
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
  const [gate2Enabled, setGate2Enabled] = useState(false);

  // 🔹 Fetch capacity & resolution ONCE
useEffect(() => {
    const load = async (scaleId) => {
        const res = await fetch(`${BaseUrl}/print-type?scaleId=${scaleId}`);
        const d = await res.json();
        return { capacity: d.capacity, resolution: d.resolution };
    };
    Promise.all([load('GATE_1'), load('GATE_2')])
        .then(([g1, g2]) => setScaleConfig({ GATE_1: g1, GATE_2: g2 }))
        .catch(err => console.error(err));
}, []);

  useEffect(() => {
    fetch(`${BaseUrl}/scale`)
      .then(res => res.json())
      .then(configs => {
        const gate2 = configs.find(c => c.scaleId === 'GATE_2');
        setGate2Enabled(!!gate2?.enabled);
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

  const scaleNumberOne = gate2Enabled  ? "1" : "";

  return (
    <div className='test-wrap'>
      <h2>
        <FaDumpster color='gray' /> Dump Site
      </h2>

      <div className='dump-site' style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h3 style={{color: "white", marginBottom: "1rem"}}>Scale {scaleNumberOne}</h3>
          <h2 style={{ color: weightColor(weights.GATE_1) }}>
            <FaWeight /> {weights.GATE_1 || "--"}
          </h2>
        </div>

        {gate2Enabled && (
          <div>
            <h3 style={{color: "white", marginBottom: "1rem"}}>Scale 2</h3>
            <h2 style={{ color: weightColor(weights.GATE_2) }}>
              <FaWeight /> {weights.GATE_2 || "--"}
            </h2>
          </div>
        )}
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
