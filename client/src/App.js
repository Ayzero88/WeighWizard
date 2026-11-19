import './components/reuse/authAxios.js';
import React, { useCallback, useEffect, useState } from "react";
import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "./components/reuse/BaseUrl";
import Spinner from "./components/reuse/Spinner";
import Lsc from "./components/pages/LS/Lsc";


const App = () => {
// components
    const [homeComponent, setHomeComponent] = useState({
        showDashBoard: false,
    });
    const [licenseValid, setLicenseValid] = useState(false);
    const [isTrial, setIsTrial] = useState("");
    const [remainingDays, setDaysRemaining] = useState("");
    const [content, setContent] = useState({
          home: true,
          login: false,
          createUser: false,
          createTabs: false,
          linkDB: false,
          linkScale: false,
          updateScaleParams: false,
          printType: false,
          test: false,
          capture: false,
          service: false,
      });
    const [loading, setLoading] = useState(true);
    
    const [confirmAlert, setConfirmAlert] = useState({
      message: "",
      type: "",
      visible: false,
      onConfirm: null,
    });

      const [ticketField, setTicketField] = useState({
        tid: "", client: "", address: "", product: "", batchNo: "", remark: "",
        carrier: "", operator: "", dest: "", tel: "", vehicleNo: "", unit: "Kg"
      });

    const showAlert = useCallback((message, type)=>{
                setAlert({
                message,
                type,
                visible: true,
                });

    }, []);

    const [alert, setAlert] = useState({
            message: "",
            type: "",
            visible: false,
    });

    const showConfirmAlert = useCallback((message, type, onConfirm) => {
  setConfirmAlert({
    message,
    type,
    visible: true,
    onConfirm,
  });
}, []);

const closeConfirmAlert = useCallback(() => {
  setConfirmAlert({
    message: "",
    type: "",
    visible: false,
    onConfirm: null,
  });
}, []);



    const checkLicense = useCallback(async () => {
        try {
        const response = await axios.get(`${BaseUrl}/l/status`);
        setLicenseValid(response.data.valid);
        setIsTrial(response.data.trial);
        setDaysRemaining(response.data.daysRemaining);
        setLoading(false);
        } catch (err) {
            setLicenseValid(false);
             setIsTrial(false);
             setDaysRemaining(0);
              console.error("Unable to fetch lx status", err);
              setLoading(false);
        };
  }, []);
    const closeAlert = ()=>{
            setAlert(prev=>({
            ...prev,
            visible: false,
            }))
    };

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
        checkLicense();

    }, [checkLicense]);


  return (
  <Router>
    {loading ? (
      <Spinner message="Loading ..." />
    ) : licenseValid ? (
      <Routes>
        <Route
          path="/"
          element={
            <Home
              homeComponent={homeComponent}
              setHomeComponent={setHomeComponent}
              content={content}
              setContent={setContent}
              handleSaveSession={handleSaveSession}
              showAlert={showAlert}
              alert={alert}
              closeAlert={closeAlert}
              showConfirmAlert={showConfirmAlert}
              closeConfirmAlert={closeConfirmAlert}
              confirmAlert={confirmAlert}
              isTrial={isTrial}
              remainingDays={remainingDays}
              ticketField={ticketField}
              setTicketField={setTicketField}
            />
          }
        />
      </Routes>
    ) : (
      <Lsc
        onActivated={checkLicense}
        showAlert={showAlert}
        alert={alert}
        closeAlert={closeAlert}
        isTrial={isTrial}
        remainingDays={remainingDays}
        showConfirmAlert={showConfirmAlert}
        closeConfirmAlert={closeConfirmAlert}
        confirmAlert={confirmAlert}
      />
    )}
  </Router>
);


};

export default App;



