import React, { useEffect, useState } from "react";
import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
// components
 const [homeComponent, setHomeComponent] = useState({
        showDashBoard: false,
    });

   const [content, setContent] = useState({
          home: true,
          createTabs: false,
          linkDB: false,
          linkScale: false,
          updateScaleParams: false,
          printType: false,
          test: false,
          capture: false,
          service: false,
      });

      const handleSaveSession = (comp, cont) =>{
            sessionStorage.setItem("homeComponent", JSON.stringify(comp));
            sessionStorage.setItem("content", JSON.stringify(cont));
      };

      useEffect(() => {
        // Load from sessionStorage on mount
        const savedComponent = sessionStorage.getItem("homeComponent");
        const savedContent = sessionStorage.getItem("content");

        if (savedComponent) setHomeComponent(JSON.parse(savedComponent));
        if (savedContent) setContent(JSON.parse(savedContent));
    }, []);


  return(
      <Router>
            <Routes>
            <Route path="/" element={
                <Home    
                homeComponent={homeComponent}
                setHomeComponent={setHomeComponent}
                content={content}
                setContent={setContent}
                handleSaveSession={handleSaveSession}
            />
            }/>
          
          </Routes>
      </Router>

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
