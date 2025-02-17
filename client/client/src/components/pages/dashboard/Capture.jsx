import React, { useEffect, useRef, useState } from 'react';
import { FaBalanceScale, FaCamera, FaCircle, FaCircleNotch, FaDotCircle, FaEye, FaListOl, FaPenFancy, FaPlay, FaSearch, FaStop, FaWeight} from 'react-icons/fa';
import useWebSocket from './ManageWS';
import Preview from './Preview';
import { FiEdit } from 'react-icons/fi';

const Capture = ({setShowDashBoard, setShowExp}) => {
   const [isRunning, setIsRunning] = useState(false); // Track whether WebSocket is running
    const [wsInstance, setWsInstance] = useState(null); // Store the WebSocket instance
    const [showTare, setShowTare] = useState(false);
    const [showCap, setShowCap] = useState(false);
    const [showStart, setShowStart] = useState(true);
    const [showStop, setShowStop] = useState(false); 
     const [isToggle, setIsToggle] = useState({
            standard: false,
            straight: false,
        });
    const [ticketField, setTicketField] = useState({
      tid: "",
      client: "",
      address: "",
      product: "",
      batchNo: "",
      carrier: "",
      operator: "",
      dest: "",
      tel: "",
      vehicleNo: "",
      unit: "Kg",
    });

    const [capturedParams, setCapturedParams] = useState({
      istCap: "",
      secCap: "",
      tareCap: "",
      netCap: "", 
      grossCap: "",
      fDate: "",
      sDate: "",
      tDate: "",
      gDate: "",
      nDate: "",
    });

    const [showPreview, setShowPreview] = useState(false);

    const tareRef = useRef(null);
    const readingRef = useRef(null);

    const handleInputChange =(e) =>{
      const {name, value} = e.target;
      setTicketField({
          ...ticketField,
          [name]: value
      });
    };

    // Change WebSocket URL to use port 8080
    const { weight, stop, wsInstance: newWsInstance } = useWebSocket({ url: isRunning ? "ws://localhost:8080" : null });

    const handleStart = () => {
      setIsRunning(true); // Start the WebSocket connection
      setWsInstance(newWsInstance); // Set the new WebSocket instance

      if (readingRef.current.value !== "Not Connected"){
        setShowCap(true);
        setShowTare(true);
        setShowStop(true);
        setShowStart(false);
      };
    };

    const handleStop = () => {
    
        stop(); // Stop the WebSocket connection
        setIsRunning(false); // Update state to stop WebSocket
        setWsInstance(null); // Clear the WebSocket instance
        setShowTare(true);
        clearReadings();
        setShowCap(false);
        setShowTare(false);
        setShowStart(true);
        setShowStop(false);
    };

    const clearReadings = () =>{
      setCapturedParams({
        istCap: "",
        secCap: "",
        tareCap: "",
        netCap: "", 
        grossCap: "",
      });
    };
    const handleStraightCapture = () => {
        
          try{
              
              setCapturedParams(prevCap =>{
                          setShowCap(false);
                          if(!prevCap.istCap && !prevCap.tareCap){
                              setShowTare(false);
                              const firstCap = weight;
                              return {...prevCap, grossCap: firstCap, gDate: new Date().toISOString()};

                          }else if(prevCap.tareCap){

                            setShowTare(false);
                            const firstCap = weight;
                            const netCapture = Math.floor((firstCap - prevCap.tareCap)*100)/100;
                            const grossCapture = Math.floor((netCapture + prevCap.tareCap)*100)/100;

                            if(netCapture < 0){
                        
                              setShowTare(true);
                              handleStart();
                              handleStop();
                              return ;
                            }else{
                          
                              return {...prevCap, grossCap: grossCapture, netCap: netCapture, gDate: new Date().toISOString(), nDate: new Date().toISOString() }
                            };
                          };
                      });

          }catch(error){
              console.error("Error capturing weight", error);
          }
        
    };

    const handleStandardCapture = () => {
      
        try {
          setCapturedParams(prevCap =>{

              if(!prevCap.istCap && !prevCap.secCap){
                const firstCap = weight;
                return {...prevCap, istCap: firstCap, fDate: new Date().toISOString()};
              };

              if(prevCap.istCap && !prevCap.secCap){
                  const secondCap = weight;
                  const netCapture = Math.abs(Math.round((secondCap - prevCap.istCap)*100)/100);
                  return {...prevCap, secCap: secondCap, netCap: netCapture, sDate: new Date().toISOString(), nDate: new Date().toISOString()};

              };
          });
          
        } catch (error) {
          console.error("Error capturing weight", error);
        };
    };

    const handleTare = () => {
      setCapturedParams(prevCap=>{
        if(!prevCap.istCap && !prevCap.tareCap){
          setShowTare(false);
          return {...prevCap, tareCap: weight, tDate: new Date().toISOString()};
        };
      });
    };

    const handleView = (e) => {
      e.preventDefault();
      if(!ticketField.tid){
        alert("Please enter Transaction ID");
        return;
      };
      setShowPreview(true);
      setShowDashBoard(false);
      setShowExp(false);
    };

    const handleSearch = () =>{};

   useEffect(()=>{
          let printType = {standard: false, straight: false}
          fetch('http://localhost:5000/print-type-param')
          .then(response => response.json())
          .then(data =>{
              printType[data.printType.ptype] = true;
              setIsToggle(printType);
          })
          .catch(error => console.error("Failed to fetch print type params. Check database connection.", error));
      }, []);
  return (
    <>
        {!showPreview ? <div className='capture-wrap'>
          <div className='print-type-transact'>
            <div className='print-type'>
                    <div className='sub-header'><h4> <FaListOl/> Ticket Entry Field</h4></div>
                <form>
                    <div className='save-btn'>
                        <button onClick={handleView}><FaEye/></button>
                    </div>
                    
                    <div>
                      <input placeholder='Transaction Id' name='tid' value={ticketField.tid} onChange={handleInputChange}/>
                      <input placeholder='Company' name='client' value={ticketField.client} onChange={handleInputChange}/>
                      <input placeholder='Address' name='address' value={ticketField.address} onChange={handleInputChange}/>
                    </div>
                    <div>
                      <input placeholder='Product' name='product' value={ticketField.product} onChange={handleInputChange}/>
                      <input placeholder='Batch No' name='batchNo' value={ticketField.batchNo} onChange={handleInputChange}/>
                      <input placeholder='Carrier' name='carrier' value={ticketField.carrier} onChange={handleInputChange}/>
                    </div>
                    
                    <div>
                        <input placeholder='Destination' name='dest' value={ticketField.dest} onChange={handleInputChange}/>
                        <input placeholder='Telephone' name='tel' value={ticketField.tel} onChange={handleInputChange}/>
                        <input placeholder='Vehicle Number' name='vehicleNo' value={ticketField.vehicleNo} onChange={handleInputChange}/>
                    </div>
                
                </form>
            </div>
            <div className='transact'>
                <div className='sub-header'>
                  <h4> <FaBalanceScale/>Transactions</h4> 
                  <div className='searchBox'>
                      <input placeholder='Find Transactions' name='transactions'/>
                      <button onClick={handleSearch}><FaSearch /></button>
                  </div>   
                </div>
                <div className='transactions'>
                      <div className='trans-content-wrap'> 
                        <div className='content'><FaCircleNotch color='lightgreen'/> <p>TID: 1 | Lacasera | 14/12/2025</p> </div> 
                        <div><FaPenFancy cursor="pointer"/></div>
                      </div>
                      <div className='trans-content-wrap'> 
                        <div className='content'><FaCircleNotch color='lightgreen'/> <p>TID: 1 | Lacasera | 14/12/2025</p> </div> 
                        <div><FaPenFancy cursor="pointer"/></div>
                      </div>
                      <div className='trans-content-wrap'> 
                        <div className='content'><FaCircleNotch color='lightgreen'/> <p>TID: 1 | Lacasera | 14/12/2025</p> </div> 
                        <div><FaPenFancy cursor="pointer"/></div>
                      </div>
                      <div className='trans-content-wrap'> 
                        <div className='content'><FaCircleNotch color='lightgreen'/> <p>TID: 1 | Lacasera | 14/12/2025</p> </div> 
                        <div><FaPenFancy cursor="pointer"/></div>
                      </div>
                      <div className='trans-content-wrap'> 
                        <div className='content'><FaCircleNotch color='lightgreen'/> <p>TID: 1 | Lacasera | 14/12/2025</p> </div> 
                        <div><FaPenFancy cursor="pointer"/></div>
                      </div>
                      <div className='trans-content-wrap'> 
                        <div className='content'><FaCircleNotch color='lightgreen'/> <p>TID: 1 | Lacasera | 14/12/2025</p> </div> 
                        <div><FaPenFancy cursor="pointer"/></div>
                      </div>
                  </div>

            </div>
          </div>
          <div className='capturing-wrap'>
                
                <div className='capturing'>
                    <div className='sub-header'>
                        <h4> <FaCamera/> Capture </h4>
                        <h4> <FaWeight/> {isToggle.standard ? "Standard" : 'Straight'} </h4>
                    </div>
                    <div className='reading-box'>
                        <h3 ref={readingRef} style={{color: weight ? 'green' : 'gray'}}>{weight || "Not Connected"}</h3>
                        {weight && 
                        <select className='unit' name='unit' value={ticketField.unit} onChange={handleInputChange}>
                            <option value="Kg">Kg</option>
                            <option value="g">g</option>
                            <option value="lb">lb</option>
                            <option value="oz">Oz</option>
                            <option value="T">Ton</option>
                        </select>}
                    </div>
                    <div className='cap-btns'>
                        {showCap && <button onClick={isToggle.straight ? handleStraightCapture : handleStandardCapture}><FaCamera/></button>}
                        {(showTare && isToggle.straight) && <button onClick={handleTare} ref={tareRef}>Tare</button>}
                        {(showStart) && <button onClick={handleStart}><FaPlay/></button>}
                        {showStop && <button className='cap-stop' onClick={handleStop} ><FaStop/></button>}
                    </div>
                    {((capturedParams.grossCap || capturedParams.tareCap  || capturedParams.istCap)) &&
                    <div className='cap-res'>
                        {capturedParams.istCap && <> <p><span>Ist Capture:&nbsp;&nbsp;&nbsp;&nbsp;</span>   {capturedParams.istCap}{ticketField.unit}</p>
                        <hr/></>}
                        {capturedParams.secCap && <> <p><span>2nd Capture:&nbsp;&nbsp;</span>   {capturedParams.secCap}{ticketField.unit}</p>
                        <hr/></>}
                        {capturedParams.tareCap && <> <p><span>Tare Capture:&nbsp;&nbsp;</span> {capturedParams.tareCap}{ticketField.unit}</p>
                        <hr/></>}
                        {capturedParams.netCap && <> <p><span>Net Capture: &nbsp;&nbsp;</span>    {capturedParams.netCap}{ticketField.unit} </p>
                        <hr/></>}
                        {capturedParams.grossCap && <p><span>Gross Capture:</span>   {capturedParams.grossCap}{ticketField.unit} </p>}
                    </div>}

                </div>
          </div>
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
          />
        }
    </>
  )
}

export default Capture;