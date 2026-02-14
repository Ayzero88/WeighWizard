import React, { useEffect, useRef, useState } from 'react';
import { FaBalanceScale, FaBrush, FaCamera,FaCircleNotch, FaEye, FaMapPin, FaPenFancy, FaPlay, FaRedo, FaStop, FaUser, FaWeight} from 'react-icons/fa';
import Preview from './Preview';
import DateTimeString from '../../reuse/DateTimeString';
import TruncateString from '../../reuse/TruncateString';
import axios from 'axios';

const Capture = ({setShowDashBoard, setShowExp}) => {
    const [showTare, setShowTare] = useState(false);
    const [showCap, setShowCap] = useState(false);
    const [showStart, setShowStart] = useState(true);
    const [showStop, setShowStop] = useState(false); 
    const [isPending, setIsPending] = useState(false); 
    const [search, setSearch] = useState("");
    const [decimalSet, setDecimalSet] = useState(0);
    const [editTid, setEditTid] = useState(false);
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
      capDate: "",

    });
    const [showPreview, setShowPreview] = useState(false);
    const [searchableItems, setSearchableItems] = useState([]);
    const tareRef = useRef(null);
    const readingRef = useRef(null);
    const [weight, setWeight] = useState(null); // current weight
    const wsRef = useRef(null); // WebSocket instance

    const handleInputChange =(e) =>{
      const {name, value} = e.target;
      setTicketField({
          ...ticketField,
          [name]: value
      });
    };

    const startWebSocket = () => {
        if (wsRef.current) return; // already running

        const socket = new WebSocket("ws://localhost:8080/ws/weight");
        wsRef.current = socket;

        socket.onopen = () => console.log("WebSocket Connected");
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setWeight(data); // or whatever your backend sends
        };
        socket.onclose = () => console.log("WebSocket Disconnected");
      };

    const stopWebSocket = () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        setWeight(null);
      };

    const handleStart = () => {
      if(!isToggle.standard && !isToggle.straight){
         alert("Error: No weigh operation was set.");
         return;
      };
       startWebSocket();

      if (readingRef.current.value !== "Not Connected"){
        setShowCap(true);
        setShowTare(true);
        setShowStop(true);
        setShowStart(false);
      };
    };

    const handleStop = () => {

      stopWebSocket(); 
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
        capDate: "",
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
      if (!isToggle.straight) {
        alert("Weigh Operation was not set.");
        return;
      }

      try {
        const hasTare = !!capturedParams.tareCap;
        const hasFirst = !!capturedParams.grossCap;

        // UI state decisions FIRST
        setShowCap(false);
        setShowTare(false);

        setCapturedParams(prevCap => {
          // FIRST CAPTURE (no tare yet)
          if (!prevCap.istCap && !prevCap.tareCap) {
            return {
              ...prevCap,
              grossCap: formatWeight(weight, decimalSet),
              capDate: new Date().toISOString(),
              gDate: new Date().toISOString()
            };
          }

          // CAPTURE WITH TARE
          if (prevCap.tareCap) {
            const firstCap = Number(formatWeight(weight, decimalSet) ?? 0);
            const prevTare = Number(prevCap.tareCap ?? 0);

            const netCapture =
              formatWeight(firstCap - prevTare, decimalSet);

            const grossCapture =
              formatWeight(Number(netCapture) + prevTare, decimalSet);

            return {
              ...prevCap,
              grossCap: grossCapture,
              netCap: netCapture,
              gDate: new Date().toISOString(),
              nDate: new Date().toISOString()
            };
          }

          return prevCap;
        });

      } catch (error) {
        console.error("Error capturing weight", error);
      }
    };

    const handleStandardCapture = () => {
      if (!isToggle.standard) {
        alert("Weigh Operation was not set.");
        return;
      }

      // SECOND CAPTURE → hide button
      if (capturedParams.istCap && !capturedParams.secCap) {
        setShowCap(false);
      }

      setCapturedParams(prevCap => {
        if (!prevCap.istCap && !prevCap.secCap) {
          return {
            ...prevCap,
            istCap: formatWeight(weight, decimalSet),
            capDate: new Date().toISOString(),
            fDate: new Date().toISOString()
          };
        }

        if (prevCap.istCap && !prevCap.secCap) {
          const netCapture = formatWeight(weight - prevCap.istCap, decimalSet);

          return {
            ...prevCap,
            secCap: formatWeight(weight, decimalSet),
            netCap: netCapture,
            sDate: new Date().toISOString(),
            nDate: new Date().toISOString()
          };
        }

        return prevCap;
  });
    };

   const handleTare = () => {
      if (!capturedParams.istCap && !capturedParams.tareCap) {
        setShowTare(false);
      }

    setCapturedParams(prevCap => {
      if (!prevCap.istCap && !prevCap.tareCap) {
        return {
          ...prevCap,
          tareCap: formatWeight(weight, decimalSet),
          capDate: new Date().toISOString(),
          tDate: new Date().toISOString()
        };
      }

      return prevCap;
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

    const handleEditTransaction = async(tid) =>{

        try {
            const data = await axios.get(`http://localhost:8080/transactions/filter-by-id/${tid}`);
            const transaction = data?.data;
            if(transaction){
               setTicketField(prev=>({
                ...prev,
                tid: transaction.tid,
                client: transaction.company,
                address: transaction.address,
                product: transaction.product,
                batchNo: transaction.batchNo,
                carrier: transaction.carrier,
                operator: transaction.operator,
                dest: transaction.dest,
                tel: transaction.tel,
                vehicleNo: transaction.vehicleNo,
                unit: transaction.unit,
                
            }));

            setCapturedParams(prev=>({
              ...prev,
              istCap:   transaction.firstWeight,
              secCap:   transaction.lastWeight,
              tareCap:  transaction.tareWeight,
              netCap:   transaction.netWeight, 
              grossCap: transaction.grossWeight,
              fDate:    transaction.fwDate,
              sDate:    transaction.swDate,
              tDate:    transaction.twDate,
              gDate:    transaction.gwDate,
              nDate:    transaction.nwDate,

            }));

              const ops_type_lowercase = transaction?.opsType.toLowerCase();
              isToggle[ops_type_lowercase] = true;
              setIsToggle(isToggle);     
              setIsPending(true);
            }
        } catch (error) {
          console.error("Error fetching transaction");
        }
    };   


  const handleFetchTransactions = async () => {
      try {
        const { data } = await axios.get('http://localhost:8080/transactions/count'); 
        const { data: transactionsData } = await axios.get('http://localhost:8080/transactions/unfinished');

        const newTid = !editTid ? (1 + data) : "";
        
        setUnfinishedTransactions(transactionsData);
        const clientNames = transactionsData.map(client => client.company || '');
        const vehicleNums = transactionsData.map(vehicle => vehicle.vehicleNo || '');
        setSearchableItems([...new Set([...clientNames, ...vehicleNums])]);
        
        setTicketField(prev => ({ ...prev, tid: newTid }));
      } catch (error) {
        console.error("Failed to fetch transactions. Check database connection.", error);
      }
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

    const formatWeight = (value, decimals) => {
      if (value === null || isNaN(value)) return "Not Connected";

      const safeDecimals = Math.min(Math.max(decimals, 0), 4); // clamp 0–4
      return Number(value).toFixed(safeDecimals);
    };


   useEffect(()=>{
          handleFetchTransactions();
          axios.get(`http://localhost:8080/print-type`)
        .then(res => {
        const { ptype, adjustDecimal, edit } = res.data;
        if (ptype) {  
            setDecimalSet(adjustDecimal);
            setEditTid(JSON.parse(edit));
            setIsToggle({
                standard: ptype === 'standard',
                straight: ptype === 'straight',
            });
        };
    })
    .catch(err => console.error(err));
      }, []);
    
  useEffect(() => {
    return () => {
      stopWebSocket();
    };
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
                      <input type='number' placeholder='Transaction Id' name='tid'  onChange={handleInputChange} disabled={!editTid} value={ticketField.tid ?? ""}/>
                      <input  type='text' placeholder='Client' name='client'  onChange={handleInputChange} maxLength={33} value={ticketField.client ?? ""}/>
                      <input type='text' placeholder='Address' name='address' onChange={handleInputChange} maxLength={50} value={ticketField.address ?? ""}/>
                    </div>
                    <div>
                      <input  type='text' placeholder='Product' name='product' onChange={handleInputChange} maxLength={50} value={ticketField.product ?? ""}/>
                      <input  type='text' placeholder='Batch No' name='batchNo' onChange={handleInputChange} value={ticketField.batchNo ?? ""}/>
                      <input  type='text' placeholder='Carrier' name='carrier' onChange={handleInputChange} maxLength={50} value={ticketField.carrier ?? ""}/>
                    </div>
                    <div>
                        <input  type='text' placeholder='Destination' name='dest'  onChange={handleInputChange} maxLength={50} value={ticketField.dest ?? ""}/>
                        <input  type='text' placeholder='Telephone' name='tel'  onChange={handleInputChange} maxLength={12} value={ticketField.tel ?? ""}/>
                        <input  type='text' placeholder='Vehicle Number' name='vehicleNo'  onChange={handleInputChange} maxLength={12} value={ticketField.vehicleNo ?? ""}/>
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
                        
                        const formattedDataTime = DateTimeString({dateTimeString: transaction.fwDate})
                        const formattedTid = transaction.tid > 9999999999 ? "9999999999+" : transaction.tid
                        const formattedString = `TID: ${formattedTid} | Company: ${transaction.company || "Ananymous"} | V/No: ${transaction.vehicleNo || "-" } | TD: ${formattedDataTime || "No Ops"}`
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
                        <h4> <FaWeight/> {isToggle.standard ? "Standard" : isToggle.straight ? 'Straight' : null} </h4>
                    </div>
                    <div className='reading-box'>
                        <h3 ref={readingRef} style={{ color: weight !== null && !isNaN(weight) ? 'green' : 'gray' }}>
                          {weight !== null && !isNaN(weight) ? formatWeight(weight, decimalSet) : "Not Connected"}
                        </h3>

                        {weight && 
                        <select className='unit' name='unit' value={ticketField.unit || "Kg"} onChange={handleInputChange}>
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
                        {(!isNaN(capturedParams.istCap) && capturedParams.istCap !== "" && capturedParams.istCap !== null && capturedParams.istCap !== 0)  && <> <p><span>Ist Capture:&nbsp;&nbsp;&nbsp;&nbsp;</span> {capturedParams.istCap}{ticketField.unit}</p>
                        <hr/></>}
                        {(!isNaN(capturedParams.secCap) && capturedParams.secCap !== "" && capturedParams.secCap !== null && capturedParams.secCap !== 0 ) && <> <p><span>2nd Capture:&nbsp;&nbsp;</span> {capturedParams.secCap}{ticketField.unit}</p>
                        <hr/></>}
                        {(!isNaN(capturedParams.tareCap) && capturedParams.tareCap !== "" && capturedParams.tareCap !== null && capturedParams.tareCap !== 0) && <> <p><span>Tare Capture:&nbsp;&nbsp;</span>{capturedParams.tareCap}{ticketField.unit}</p>
                        <hr/></>}
                        {(!isNaN(capturedParams.netCap) && capturedParams.netCap !== "" && capturedParams.netCap !== null && capturedParams.netCap !== 0) && <> <p><span>Net Capture: &nbsp;&nbsp;</span>    {capturedParams.netCap}{ticketField.unit} </p>
                        <hr/></>}
                        {(!isNaN(capturedParams.grossCap) && capturedParams.grossCap !== "" && capturedParams.grossCap !== null && capturedParams.grossCap !== 0) && <p><span>Gross Capture:</span> {capturedParams.grossCap}{ticketField.unit} </p>}
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