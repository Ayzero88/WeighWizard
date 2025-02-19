import React, { useState } from "react";
import Home from "./components/pages/Home";

const App = () => {
// components
 const [homeComponent, setHomeComponent] = useState({
        showDashBoard: false,
    });

   const [content, setContent] = useState({
          home: true,
          linkDB: false,
          linkScale: false,
          updateScaleParams: false,
          printType: false,
          test: false,
          capture: false,
          service: false,
      });

  return(
      <div>
          <Home    
              homeComponent={homeComponent}
              setHomeComponent={setHomeComponent}
              content={content}
              setContent={setContent}
          />
      </div>

  )


};

export default App;

// function App() {
//   const [weight, setWeight] = useState("Waiting for weight data...");
//   const [socket, setSocket] = useState(null);

//   const handleStart = () => {
//     // Create WebSocket connection
//     const ws = new WebSocket("ws://localhost:8080");
//     ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         setWeight(data.weight);
//     };

//     ws.onopen = () => alert("Connected to WebSocket");
//     ws.onclose = () => alert("Disconnected from WebSocket");

//     setSocket(ws);
// };

// const handleStop = () => {
//     if (socket) {
//         socket.close();
//         setSocket(null);
//     };
// };
//   return (
//     <div className="ui">
//       <h1>WeighWiz - Live Weight</h1>
//       <h2>Current Weight: {weight} kg</h2>
//       <div className="btn">
//         <button onClick={handleStart}>Start</button>
//         <button onClick={handleStop}>Stop</button>
//       </div>
      
//     </div>
//   );
// }

// export default App;
