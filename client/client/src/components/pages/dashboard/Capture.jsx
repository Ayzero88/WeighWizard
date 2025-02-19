import React, { useEffect, useRef, useState } from 'react';
import { FaBalanceScale, FaBox, FaBrush, FaCamera, FaCircle, FaCircleNotch, FaDashcube, FaDotCircle, FaEye, FaMapPin, FaPenFancy, FaPlay, FaRedo, FaSearch, FaStop, FaUser, FaWeight} from 'react-icons/fa';
import useWebSocket from './ManageWS';
import Preview from './Preview';
import DateTimeString from '../../reuse/DateTimeString';
import TruncateString from '../../reuse/TruncateString';


const Capture = ({setShowDashBoard, setShowExp}) => {
   const [isRunning, setIsRunning] = useState(false); // Track whether WebSocket is running
    const [wsInstance, setWsInstance] = useState(null); // Store the WebSocket instance
    const [showTare, setShowTare] = useState(false);
    const [showCap, setShowCap] = useState(false);
    const [showStart, setShowStart] = useState(true);
    const [showStop, setShowStop] = useState(false); 
    const [isPending, setIsPending] = useState(false); 
    const [search, setSearch] = useState("");
    const [unfinishedTransactions, setUnfinishedTransactions] = useState([]);
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
    const [searchableItems, setSearchableItems] = useState([]);
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
      setShowStop(false);
      setShowStart(true);
      setShowCap(false);
      clearCapParams();
    
      if(!isPending){
 
          setShowTare(true);
          clearCapParams();
          setShowTare(false);
      }else{

          setIsPending(false);
          clearTicketField();
          setTicketField(prev=>({...prev, unit: ticketField.unit}));
          
        };

    };

    const clearCapParams = () =>{
      setCapturedParams(prev=>({
        ...prev,
        istCap: "",
        secCap: "",
        tareCap: "",
        netCap: "", 
        grossCap: "",
      }));
    };

    const clearTicketField = () =>{
      setTicketField(prev =>({
        ...prev,
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
        unit: "",
      }));
    };

    const handleWipe = ()=>{
      setIsPending(false);
      clearCapParams();
      clearTicketField();
      handleFetchTransactions();
      if(!showStart) setShowCap(true);
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
                  setShowCap(false);
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
      if(!ticketField.tid || !ticketField.client){
        alert("Please enter the company's Name");
        return;
      };
      setShowPreview(true);
      setShowDashBoard(false);
      setShowExp(false);
      
    };

    const handleEditTransaction = (tid) =>{
        const transaction = unfinishedTransactions.find(transaction => transaction.tid === tid);
        setTicketField({
          tid: transaction.tid,
          client: transaction.company,
          address: transaction.address,
          product: transaction.product,
          batchNo: transaction.batch_no,
          carrier: transaction.carrier,
          operator: transaction.operator,
          dest: transaction.dest,
          tel: transaction.tel,
          vehicleNo: transaction.vehicle_no,
          unit: transaction.unit,
        });

        setCapturedParams({
          istCap: transaction.first_weight,
          secCap: transaction.last_weight,
          tareCap: transaction.tare_weight,
          netCap: transaction.net_weight, 
          grossCap: transaction.gross_weight,
          fDate: transaction.fw_date,
          sDate: transaction.sw_weight,
          tDate: transaction.tw_weight,
          gDate: transaction.gw_weight,
          nDate: transaction.nw_weight,

        });

        const ops_type_lowercase = transaction.ops_type.toLowerCase();
        isToggle[ops_type_lowercase] = true;
        setIsToggle(isToggle);     
        setIsPending(true);
    };   


    const handleFetchPrintType = () =>{
      let printType = {standard: false, straight: false}
      fetch('http://localhost:5000/print-type-param')
      .then(response => response.json())
      .then(data =>{
          printType[data.printType.ptype] = true;
          setIsToggle(printType);
      })
      .catch(error => console.error("Failed to fetch print type params. Check database connection.", error));

    };

    const handleFetchTransactions = () =>{
        fetch('http://localhost:5000/transactions')
        .then(response => response.json())
        .then(data=>{
          const newTid = 1 + data.numOfTransactions;
          setUnfinishedTransactions(data.result);
          setTicketField(prev=>({...prev, tid: newTid}));
          const clientNames = data.result.map((client) => client.company);
          const vehicleNums = data.result.map((vehicle) => vehicle.vehicle_no);
          setSearchableItems([...new Set([...clientNames, ...vehicleNums])]) 
        })
        .catch(error => console.error("Failed to fetch transactions. Check database connection.", error));
    };

    const escapeRegExp=(string)=> {
      return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }; 

    const escapedSearchInput = escapeRegExp(search);
    let filteredData;

    if (search.length >= 3) {
        filteredData= searchableItems.length > 0 && searchableItems.filter((name)=> {
          
          if (!name) return null; // Skip if name is falsy
          
          const regex = new RegExp(`^${escapedSearchInput.slice(0,3)}`, 'i'); // 'i' flag for case-insensitive matching
          return regex.test(name);
      });
    } else {
      filteredData = null; // Disable the function
    };
    
    const handleChoice =(item)=> {
        const filteredBoxByItem = unfinishedTransactions.length > 0 && unfinishedTransactions.filter((name)=> name.company === item || name.vehicle_no === item);
      
        if (filteredBoxByItem){
            setUnfinishedTransactions(filteredBoxByItem);
            setSearch('');
        };
    };

    const handleRefetch = ()=>{
        setSearch('');
        handleFetchTransactions();
    };

   useEffect(()=>{
          handleFetchPrintType();
          handleFetchTransactions();
      }, []);

  return (
    <>
        {!showPreview ? <div className='capture-wrap'>
          <div className='print-type-transact'>
            <div className='print-type'>
                    <div className='sub-header'><h4> <FaUser/> Client Entry Field</h4></div>
                    <div className='save-btn'>
                        <button onClick={handleView}><FaEye/></button>
                        <button onClick={handleWipe}><FaBrush/></button>
                    </div>
                <form style={isPending ? {pointerEvents: 'none', cursor: 'default'}: {pointerEvents: 'auto', cursor: 'pointer'}}>
                  
                    
                    <div>
                      <input placeholder='Transaction Id' name='tid' value={ticketField.tid} onChange={handleInputChange} disabled/>
                      <input placeholder='Company' name='client' value={ticketField.client} onChange={handleInputChange} maxLength={33}/>
                      <input placeholder='Address' name='address' value={ticketField.address} onChange={handleInputChange} maxLength={50}/>
                    </div>
                    <div>
                      <input placeholder='Product' name='product' value={ticketField.product} onChange={handleInputChange} maxLength={50}/>
                      <input placeholder='Batch No' name='batchNo' value={ticketField.batchNo} onChange={handleInputChange}/>
                      <input placeholder='Carrier' name='carrier' value={ticketField.carrier} onChange={handleInputChange} maxLength={50}/>
                    </div>
                    
                    <div>
                        <input placeholder='Destination' name='dest' value={ticketField.dest} onChange={handleInputChange} maxLength={50}/>
                        <input placeholder='Telephone' name='tel' value={ticketField.tel} onChange={handleInputChange} maxLength={12}/>
                        <input placeholder='Vehicle Number' name='vehicleNo' value={ticketField.vehicleNo} onChange={handleInputChange} maxLength={12}/>
                    </div>
                
                </form>
            </div>
            <div className='transact'>
                <div className='sub-header'>
                  {isToggle.standard ? <h4> <FaBalanceScale/> Pending Transactions [{unfinishedTransactions.length > 9999999999 ? `9999999999+` : unfinishedTransactions.length }]</h4> : <h4>Pending Transactions</h4>} 
                  {isToggle.standard && <div className='searchBox'>
                      <input placeholder='Find Transactions' name='search' value={search} onChange={(e)=>setSearch(e.target.value)}/>
                      {filteredData && filteredData.length > 0 ? 
                          <div className='display-items'>
                                  {filteredData.length > 0 && filteredData.map((item, index)=>
                                      (<ul key={index}>
                                          <li onClick={()=>handleChoice(item)}> <FaMapPin color='orange'/>{item}</li> 
                                      </ul>))}
                          </div> 
                          : 
                          null} 
                      <button onClick={handleRefetch}><FaRedo /></button>
                  </div>} 
               
                </div>
               {isToggle.standard && <div className='transactions'>

                    { unfinishedTransactions.length > 0 ? 
                      unfinishedTransactions.map((transaction, index)=>{ 
                        
                        const formattedDataTime = DateTimeString({dateTimeString: transaction.fw_date})
                        const formattedTid = transaction.tid > 9999999999 ? "9999999999+" : transaction.tid
                        const formattedString = `TID: ${formattedTid} | Company: ${transaction.company || "Ananymous"} | V/No: ${transaction.vehicle_no || "-" } | TD: ${formattedDataTime || "No Ops"}`
                        const truncatedString = TruncateString({str: formattedString, maxLength: 115})
                     
                        return(
                        <div className='trans-content-wrap' key={transaction.tid}> 
                          <div className='content'><FaCircleNotch size={9} color='orange'/> <p>{truncatedString}</p> </div> 
                          <div><FaPenFancy cursor="pointer" onClick={()=>handleEditTransaction(transaction.tid)}/></div>
                      </div>)}) : <p style={{fontStyle: 'italic'}}>No pending transactions...</p>

                    }
                  </div>}

                  {isToggle.straight && 
                  <div className='transactions'>
                        <p style={{fontStyle: 'italic'}}>Not Applicable for Straight Weighing</p>
                    </div>}
                  

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
              setShowCap={setShowCap}
              isPending={isPending}
              setIsPending={setIsPending}
              handleFetchTransactions={handleFetchTransactions}
          />
        }
    </>
  )
}

export default Capture;