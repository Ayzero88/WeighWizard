import { useEffect, useRef, useState } from "react";
import { BaseUrl } from "../../reuse/BaseUrl";
import axios from "axios";
import Btn from "../../reuse/Btn";
import { FiCheck, FiCopy, FiLock } from "react-icons/fi";
import Alert from "../../reuse/Alert";
import ConfirmAlert from "../../reuse/ConfirmAlert";

export default function Lsc({ onActivated, showAlert, alert, closeAlert, remainingDays,   showConfirmAlert, closeConfirmAlert, confirmAlert }) {
  const [machineId, setMachineId] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [copied, setCopied] = useState(false);
  const divRef = useRef(null);

  const copyToClipboard = () => {
    if (divRef.current) {
      const text = divRef.current.innerText; // get text from div
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);

          setTimeout(()=>{ setCopied(false)}, 500)
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          showAlert("Failed to copy text.", "error");
          setCopied(false);
        })
        
    }
  };

    useEffect(() => {
    const fetchMachineId = async () => {
        try {
            const response = await axios.get(`${BaseUrl}/l/machine-id`);
            setMachineId(response.data);
        } catch (error) {
            setMachineId("Unable to fetch machine ID");
        };

    };

    fetchMachineId();
    }, []);

  const handleActivate = async () => {
  if (!licenseKey) {
    showAlert("Empty Lx Field!", "error");
    return;
  }

  try {
    const response = await axios.post(
      `${BaseUrl}/l/activate`,
      licenseKey,
      { headers: { "Content-Type": "text/plain" } }
    );

    // only runs on HTTP 200
    showAlert("Activation successful!", "success");
    onActivated(); // re-check license

  } catch (error) {
    console.log("Invalid Lx Key: ", error.response?.data)
    showAlert(
    "Invalid license key",
      "error"
    );
  }
};

  // Style
  const copiedText = copied ? <FiCheck/> : <FiCopy cursor="pointer" onClick={copyToClipboard}/>;

  return (
    <div className="license-container">
      <h2>Activation Required</h2>

      <p>Copy and Forward this ID for Activation:</p>
      <div className="machine-box" ref={divRef}>
         <div className="copy-text">{copiedText}</div>
        {machineId}
    </div>

      <textarea
        placeholder="Paste license key here"
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        className="license-textarea"
        
      />

      <Btn handleClick={handleActivate} btnName="Activate" icon={<FiLock/>} p="10px 20px" m="10px 0 0 0" bgc="#50350ccc" bd="none" bdr="5px" col="#ffff"/>

     <div className="rem-days">
         <p>
          Remaining Days:{" "}
          {remainingDays === "" 
            ? "Checking..." 
            : remainingDays <= 0 
            ? "Expired" 
            : remainingDays}
      </p>
    </div>
      {alert.visible && <Alert message={alert.message} type={alert.type} onClose={closeAlert}/>}

      {confirmAlert.visible && (
      <ConfirmAlert
        message={confirmAlert.message}
        type={confirmAlert.type}
        confirmText="Activate"
        cancelText="Cancel"
        onCancel={closeConfirmAlert}
        onConfirm={() => {
          confirmAlert.onConfirm?.();
          closeConfirmAlert();
        }}
      />
    )}
     
      
    </div>
  );
}
