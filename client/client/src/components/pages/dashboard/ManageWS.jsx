import { useEffect, useState, useRef } from 'react';

const useWebSocket = ({ url }) => {
  const [weight, setWeight] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!url) return; // Don't connect if URL is null

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setWeight(data.weight);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  // Stop function closes the WebSocket connection
  const stop = () => {
    if (wsRef.current) {
      wsRef.current.close();
      console.log("WebSocket manually stopped");
    }
  };

  return { weight, stop, wsInstance: wsRef.current };
};

export default useWebSocket;
