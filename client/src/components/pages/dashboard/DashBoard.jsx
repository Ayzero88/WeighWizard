import React, { useEffect, useRef, useState } from 'react';
import { FaDatabase, FaWeight, FaDashcube,FaLink, FaCamera, FaTimes, FaArrowUp, FaPrint, FaCog, FaRedo, FaTable } from 'react-icons/fa';
import cableImage from '../../asset/UI/connects.svg';
import { FiArrowLeft, FiArrowRight, FiLogOut} from 'react-icons/fi';
import DataBaseConfig from './DataBaseConfig';
import ScaleConfig from './ScaleConfig';
import Test from './Test';
import Exit from '../../reuse/Exit';
import Logo from '../../reuse/Logo';
import UpdateScaleConfig from './UpdateScaleConfig';
import Capture from './Capture';
import PrintType from './PrintType';
import Service from './Service';
import CreateTabs from './CreateTabs';
import Tooltip from '../../reuse/Tooltip';
import RequireRole from '../../auth/RequiredRole';
import OperatorOnDuty from './OperatorOnDuty';
import { BaseUrl, WsUrl } from '../../reuse/BaseUrl';
import axios from 'axios';



const DashBoard = ({homeComponent, setHomeComponent, content, setContent,  handleSaveSession, 
                    showAlert,  showConfirmAlert, user, remainingDays,  ticketField, setTicketField}) => {
    const [showDashBoard, setShowDashBoard] = useState(true);
    const [showExp, setShowExp] = useState(true);
    const [isToggle, setIsToggle] = useState({ standard: false, straight: false });
    const [decimalSet, setDecimalSet] = useState(0);
    const [weights, setWeights] = useState({ GATE_1: null, GATE_2: null });
    const [decimalSets, setDecimalSets] = useState({ GATE_1: 0, GATE_2: 0 });
    const [gate2Enabled, setGate2Enabled] = useState(false);
    const [showStop, setShowStop] = useState(false);
    const [showTare, setShowTare] = useState(false);
    const wsRef = useRef(null); // WebSocket instance
    const tareRef = useRef(null);
    const readingRef = useRef(null);

    const weight = weights.GATE_1;
    const setWeight = (v) => setWeights(prev => ({ ...prev, GATE_1: v }));
    

        // ---------- WebSocket ----------
    const startWebSocket = () => {
            if (wsRef.current) return; // already running

            const socket = new WebSocket(WsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                console.log("WebSocket Connected");
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const scaleId = data.scaleId || "GATE_1";

                    let next = "";
                    if (data.type === "weight") {
                        const numericWeight = parseFloat(data.value);
                        next = !isNaN(numericWeight) ? numericWeight : "";
                    }

                    // update only the scale that sent this message
                    setWeights(prev => prev[scaleId] === next ? prev : { ...prev, [scaleId]: next });
                } catch (err) {
                    setWeights({ GATE_1: "", GATE_2: "" });
                }
            };

            socket.onclose = () => {
                console.log("WebSocket Disconnected");
                setWeights({ GATE_1: "Not connected", GATE_2: "Not connected" });
                wsRef.current = null;
            };

            socket.onerror = () => {
                setWeights({ GATE_1: "Not connected", GATE_2: "Not connected" });
            };
    };

    const stopWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setWeights({ GATE_1: null, GATE_2: null });
    };
 
    const handleDashToggle = ()=>{
        setShowDashBoard(prev => !prev);
    };

    const handleContents = (content)=>{
        let cont;
        switch(content) {
            case 1:
                cont = {linkDB: true};
                setContent(cont);
                break;
            case 2:
                cont = {linkScale: true};
                setContent(cont);
                break;
            case 3:
                cont = {updateScaleParams: true};
                setContent(cont);
                break;

            case 4:
                cont = {printType: true};
                setContent(cont);
                break;
            case 5:
                cont = {test: true};
                setContent(cont);
                break;

            case 6:
                cont = {capture: true};
                setContent(cont);
                break;
            case 7:
                cont = {service: true};
                setContent(cont);
                break;
            case 8:
                cont = {createTabs: true};
                setContent(cont);
                break;
            default:
                cont = {home: true};
                setContent(cont);
                break;
        };
        handleSaveSession(homeComponent, cont);
    };

    const handleExit = ()=>{
        setContent({home: true});
        setShowExp(true);
        handleSaveSession(homeComponent, {home: true});
    };

    const handleReload =()=>{window.location.reload()};

    const handleLogout = () =>{
        localStorage.removeItem("up");
        sessionStorage.removeItem("content");
        sessionStorage.removeItem("handleComponent");
        handleExit();
        setHomeComponent({showDashBoard: false});
        handleSaveSession({showDashBoard: false}, content);
    };

    const handleFetchPrintType = async () => {
        try {
            const printData = await axios.get(`${BaseUrl}/print-type`);
            const { ptype, adjustDecimal } = printData.data;
            setDecimalSet(adjustDecimal);
            setIsToggle({ standard: ptype === 'standard', straight: ptype === 'straight' });

            // Is Gate 2 enabled? If so, load its own decimal setting too
            const scales = await axios.get(`${BaseUrl}/scale`);
            const g2 = (scales.data ?? []).find(c => c.scaleId === 'GATE_2');

            if (g2?.enabled) {
                setGate2Enabled(true);
                const p2 = await axios.get(`${BaseUrl}/print-type`, { params: { scaleId: 'GATE_2' } });
                setDecimalSets({ GATE_1: adjustDecimal, GATE_2: p2.data.adjustDecimal });
            } else {
                setDecimalSets({ GATE_1: adjustDecimal, GATE_2: adjustDecimal });
            }
        } catch (error) {
            console.error("Error fetching print-type data", error);
        };
    };

    useEffect(() => {

      handleFetchPrintType();
      return () => stopWebSocket();
    }, []);


  return (
    <div className='dash-wrap'>
       { showDashBoard && 

       <div className='dashboard'>
            <h3><FaDashcube color='#fff'/> Axpanel</h3>
            <hr/>
            <div className='dash-menu'>
                    <ul>
                            {["superadmin"].includes(user?.role) && <li onClick={()=>handleContents(8)}> <FaTable color='#fff'/> Create Database</li>}
                            <li onClick={()=>handleContents(1)}> <FaDatabase color='#fff'/>  Check DB Link</li>
                            {["superadmin", "admin", "operator"].includes(user?.role) && <li onClick={()=>handleContents(2)}> <FaWeight color='#fff'/> Scale Params</li>}
                            {["superadmin", "admin"].includes(user?.role) && <li onClick={()=>handleContents(3)}> <FaArrowUp color='#fff'/> Update Params</li>}
                            {["superadmin", "admin"].includes(user?.role) && <li onClick={()=>handleContents(4)}> <FaPrint color='#fff'/> Weigh Config</li>}
                            {["superadmin", "admin"].includes(user?.role) && <li onClick={()=>handleContents(5)}> <FaLink color='#fff'/> Test Connection </li>}
                            {["superadmin", "admin", "operator"].includes(user?.role) && <li onClick={()=>handleContents(6)}> <FaCamera color='#fff'/> Capture Weight</li>}
                            {["superadmin", "admin", "operator"].includes(user?.role) && <li onClick={()=>handleContents(7)}> <FaCog color='#fff'/> Service Center</li>}
                            {remainingDays > 0 && ["superadmin", "admin", "operator"].includes(user?.role) && <li className='trial-days'>Remaining Days: {remainingDays <= 0 ? "Expired" : remainingDays}</li>}
                    
                    </ul>
                    <Logo fs='1rem' imgWt='30rem' spanCol="#ffff" tcol="#ffff"/>
            </div>
            
        </div>}
        <div className='cd' style={{width: showDashBoard ? '80%' : "100%"}}>
            {content.home && 
            <div className='dash-title'>
                 <img src={cableImage} alt='cable'/>
                 <Logo fs="3rem" imgWt="10rem" spanCol="#ffff"/>
                
            </div>}

            {content.createTabs && 
            <RequireRole allowedRoles={["superadmin"]} showAlert={showAlert} setComp={setContent} comp='home'>
                <CreateTabs/>
            </RequireRole>
            }
            {content.linkDB && 
                <DataBaseConfig/>
            }

            {content.linkScale && 
                <RequireRole allowedRoles={["superadmin", "admin", "operator"]} showAlert={showAlert} setComp={setContent} comp='home'>
                    <ScaleConfig showAlert={showAlert}/>
                </RequireRole>
            }

            {content.updateScaleParams && 
                <RequireRole allowedRoles={["superadmin", "admin"]} showAlert={showAlert} setComp={setContent} comp='home'>
                    <UpdateScaleConfig showAlert={showAlert} showConfirmAlert={showConfirmAlert}/>
                 </RequireRole>
                
            }

             {content.printType && 
               <RequireRole allowedRoles={["superadmin", "admin"]} showAlert={showAlert} setComp={setContent} comp='home'>
                   <PrintType showAlert={showAlert} showConfirmAlert={showConfirmAlert}/>
                </RequireRole>
            }

            {content.test && 
                <RequireRole allowedRoles={["superadmin", "admin"]} showAlert={showAlert} setComp={setContent} comp='home'>
                    <Test/>
                </RequireRole>
            }

             {content.capture && 
              <RequireRole allowedRoles={["superadmin", "admin", "operator"]} showAlert={showAlert} setComp={setContent} comp='home'>
                <Capture 
                    setShowDashBoard={setShowDashBoard} 
                    setShowExp={setShowExp} 
                    showAlert={showAlert} 
                    setDecimalSet={setDecimalSet}
                    decimalSet={decimalSet}
                    setIsToggle={setIsToggle}
                    isToggle={isToggle}    
                    weight={weight}
                    setWeight={setWeight}
                    showStop={showStop}
                    setShowStop={setShowStop}
                    showTare={showTare}
                    setShowTare={setShowTare}
                    wsRef={wsRef}
                    tareRef={tareRef}
                    readingRef={readingRef}
                    stopWebSocket={stopWebSocket}
                    startWebSocket={startWebSocket}
                    weights={weights}
                    decimalSets={decimalSets}
                    gate2Enabled={gate2Enabled}
                    ticketField={ticketField}
                    setTicketField={setTicketField}
                />
              </RequireRole>
            }

            {content.service && 
                <RequireRole allowedRoles={["superadmin", "admin", "operator"]} showAlert={showAlert} setComp={setContent} comp='home'>
                    <Service 
                        showAlert={showAlert}
                        showConfirmAlert={showConfirmAlert}
                        user={user}
                        setIsToggle={setIsToggle}
                        isToggle={isToggle}   
                        gate2Enabled={gate2Enabled}

                    />
                </RequireRole>
                } 

            <div className='nav'>
                 <ul>
                    {showExp && <li onClick={handleDashToggle}>{showDashBoard ? <FiArrowLeft size={20} color='#b08d57'/> : <FiArrowRight size={20} color='#b08d57'/> }</li>}
                        {(!content.capture && ['superadmin', 'admin', 'operator'].includes(user?.role)) && 
                       
                        <Tooltip position='bottom' text='Capture Weight'>
                            <li onClick={()=>{
                                setContent({capture: true})
                                handleSaveSession(homeComponent, {capture: true})
                                }}><FaCamera size={20} color='gray'/>
                            </li>
                            </Tooltip>
                    }
                         <Tooltip position='bottom' text='Reload'><li onClick={handleReload}> <FaRedo size={20} color='gray' /></li></Tooltip>
                        <Tooltip position='bottom' text='Sign Out'><li onClick={handleLogout}><FiLogOut size={20} color='red'/></li></Tooltip>
                        <OperatorOnDuty user={user.username}/>
                 </ul>
            </div>

           {!content.home &&  <div className="exit-btn">
                <Exit icon={<FaTimes color='#b08d57'/>} handleClick={handleExit} />
            </div>}

        </div>
        
    </div>
  )
}

export default DashBoard;