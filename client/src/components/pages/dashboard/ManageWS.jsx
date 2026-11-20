import { useEffect, useRef, useState } from "react";

const emptyWeights = { GATE_1: null };

const useWebSocket = ({ url, configs, capacity, resolution }) => {
  const [weights, setWeights] = useState(emptyWeights);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  const settingsRef = useRef({ configs, capacity, resolution });
  settingsRef.current = { configs, capacity, resolution };  

  const getDecimalsFromResolution = (res) => {
    if (!res) return 0;
    const resStr = res.toString();
    if (!resStr.includes(".")) return 0;
    return resStr.split(".")[1].length;
  };

  // Update one gate only; skip the state update if the value didn't change
  // (avoids pointless re-renders when a scale sits at a stable reading)
  const setGateWeight = (scaleId, value) => {
    setWeights((prev) =>
      prev[scaleId] === value ? prev : { ...prev, [scaleId]: value }
    );
  };

  // Set every known scale to the same status text (used on error / disconnect)
  const setAllWeights = (value) => setWeights(prev => {
    const ids = new Set([...Object.keys(settingsRef.current.configs || {}), ...Object.keys(prev)]);
    if (ids.size === 0) ids.add("GATE_1");
    const next = {};
    ids.forEach(id => { next[id] = value; });
    return next;
  });

  const stop = () => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;

      wsRef.current.close();
      wsRef.current = null;
    }

    setWeights(emptyWeights);
  };

  useEffect(() => {
    if (!url) {
      stop();
      return;
    }

    shouldReconnectRef.current = true;

    const connect = () => {
      if (!shouldReconnectRef.current) return;

      console.log("Connecting WebSocket...");

      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket Connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const scaleId = data.scaleId || "GATE_1"; // fallback for untagged messages

          if (data.type === "error") {
            setGateWeight(scaleId, `Error: ${data.message}`);
            return;
          }

          if (data.type === "status") {
            setGateWeight(scaleId, data.message);
            return;
          }

          if (data.type === "weight") {
            const value = Number(data.value);

            if (Number.isNaN(value)) {
              setGateWeight(scaleId, "Invalid weight");
              return;
            }

            // Use this gate's own settings (falls back to the old single values)
            const s = settingsRef.current;
            const gate = s.configs?.[scaleId] || {
              capacity: s.capacity,
              resolution: s.resolution,
            };
            const gateCapacity = gate.capacity;
            const gateResolution = gate.resolution;

            let adjusted = value;

            if (gateResolution) {
              adjusted = Math.round(adjusted / gateResolution) * gateResolution;
            }

            const decimals = getDecimalsFromResolution(gateResolution);

            if (gateCapacity && adjusted > gateCapacity) {
              setGateWeight(scaleId, "Overload");
              return;
            }

            setGateWeight(scaleId, adjusted.toFixed(decimals));
          }
        } catch (err) {
          console.error("Invalid WebSocket message:", event.data);
          setAllWeights("Com err");
        }
      };

      socket.onclose = () => {
        console.log("WebSocket Disconnected");
        setAllWeights("Disconnected");

        if (shouldReconnectRef.current) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => stop();
  }, [url, capacity, resolution]);

  return { weight: weights.GATE_1, weights, stop };
};

export default useWebSocket;
