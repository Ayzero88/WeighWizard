import { useEffect, useState, useRef } from 'react';

const useWebSocket = ({ url }) => {
  const [weight, setWeight] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    wsRef.current.onmessage = (event) => {
      setWeight(event.data); // Use the raw data
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  const stop = () => {
    wsRef.current?.close();
    console.log("WebSocket manually stopped");
  };

  return { weight, stop };
};

export default useWebSocket;
