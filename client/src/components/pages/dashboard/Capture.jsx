import React, { useCallback, useEffect, useState } from 'react';
import Preview from '../capturecomponents/Preview';
import PendingTransactions from '../capturecomponents/PendingTransactions';
import Capturing from '../capturecomponents/Capturing';
import CustomerDetails from '../capturecomponents/CustomerDetails';

const Capture = ({ setShowDashBoard, setShowExp, showAlert,  setDecimalSet, decimalSet, setIsToggle, isToggle,
  wsRef, tareRef, readingRef, startWebSocket, stopWebSocket, weight, setWeight, showStop, setShowStop, showTare, 
  setShowTare, weights, decimalSets, enabledScales, multiScale,  ticketField, setTicketField
  }) => {
  
  const [showCap, setShowCap] = useState(false);
 
  const [isPending, setIsPending] = useState(false);

  const [showStart, setShowStart] = useState(true);

  const [editTid, setEditTid] = useState(false);


  const [capturedParams, setCapturedParams] = useState({
    istCap: "", secCap: "", tareCap: "", netCap: "", grossCap: "",
    fDate: "", sDate: "", tDate: "", gDate: "", nDate: "", capDate: "",
    scale1: "", scale2: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [operator, setOperator] = useState("");
  const [firstOperator, setFirstOperator] = useState(null);

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setTicketField(prev => ({ ...prev, [name]: value }));
};


  const clearCapParams = () => {
    setCapturedParams(prev => ({
      ...prev,
      istCap: "", secCap: "", tareCap: "", netCap: "", grossCap: "", capDate: "",
      scale1: "", scale2: "",
    }));
  };

  const clearTicketField = () => {
    setTicketField(prev => ({
      ...prev,
      tid: "", client: "", address: "", product: "", batchNo: "", remark: "",
      carrier: "", operator: "", dest: "", tel: "", vehicleNo: "", unit: ""
    }));
  };

  const handleOperator = useCallback(()=>{
      const getOperator = localStorage.getItem("up");
      if(getOperator){
         const parsedOperator = JSON.parse(getOperator);
         setOperator(parsedOperator.username); 
        
      };
  }, [])


  // ----------- Initialize Operator --------
  useEffect(()=>{
     handleOperator();
  }, [showPreview]);


  return (
    <>
        {!showPreview ? 
        <div className='capture-wrap'>
          
            <div className='print-type-transact'>
             
              <CustomerDetails
            
                  clearCapParams = {clearCapParams}
                  setShowCap = {setShowCap}
                  setTicketField={setTicketField}
                  ticketField={ticketField}
                  setIsPending={setIsPending}
                  isPending={isPending}
                  showStart={showStart}
                  showAlert={showAlert}
                  setShowStart={setShowStart}
                  setShowPreview={setShowPreview}
                  setShowDashBoard={setShowDashBoard}
                  setShowExp={setShowExp}
                  clearTicketField={clearTicketField}
                  editTid={editTid}
              />
              
               <PendingTransactions 
                  isToggle = {isToggle}
                  editTid = {editTid}  
                  setTicketField = {setTicketField}
                  setIsToggle = {setIsToggle}
                  showAlert = {showAlert}
                  setEditTid={setEditTid}
                  ticketField = {ticketField}
                  setCapturedParams = {setCapturedParams}
                  setIsPending = {setIsPending}
                  setFirstOperator = {setFirstOperator}
                />

               </div>

               <Capturing 
                   startWebSocket={startWebSocket}
                   stopWebSocket={stopWebSocket}
                   weight={weight}
                   setWeight={setWeight}
                   showStop={showStop}
                   setShowStop={setShowStop}
                   showTare={showTare}
                   setShowTare={setShowTare}
                   clearCapParams = {clearCapParams}
                   clearTicketField={clearTicketField}
                   setShowCap={setShowCap}
                   showCap={showCap}
                   showAlert={showAlert}
                   isPending={isPending}
                   setIsPending={setIsPending}
                   setTicketField={setTicketField}
                   ticketField={ticketField}
                   setCapturedParams={setCapturedParams}
                   capturedParams={capturedParams}
                   showStart={showStart}
                   setShowStart={setShowStart}
                  setDecimalSet={setDecimalSet}
                  decimalSet={decimalSet}
                  setIsToggle={setIsToggle}
                  isToggle={isToggle} 
                  wsRef={wsRef}
                  tareRef={tareRef}
                  readingRef={readingRef}
                  weights={weights}
                  decimalSets={decimalSets}
                  enabledScales={enabledScales}
                  handleInputChange={handleInputChange}

                />
        </div>: 
          <Preview 

              setShowDashBoard={setShowDashBoard}
              setShowExp={setShowExp} 
              setShowPreview={setShowPreview}
              capturedParams={capturedParams}
              setCapturedParams={setCapturedParams}
              ticketField={ticketField}
              setTicketField={setTicketField}
              isToggle={isToggle}
              setShowCap={setShowCap}
              isPending={isPending}
              setIsPending={setIsPending}
              operator={operator}
              firstOperator={firstOperator}
              setFirstOperator={setFirstOperator}
              showAlert={showAlert}
              clearTicketField={clearTicketField}
              multiScale={multiScale}

          />
        }
    </>
  )
}

export default Capture;
