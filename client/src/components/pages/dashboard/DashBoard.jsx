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
    const [weights, setWeights] = useState({ GATE_1: null });
    const [decimalSets, setDecimalSets] = useState({ GATE_1: 0 });
    const [enabledScales, setEnabledScales] = useState(['GATE_1']);
    const [showStop, setShowStop] = useState(false);
    const [showTare, setShowTare] = useState(false);
    const wsRef = useRef(null); // WebSocket instance
    const tareRef = useRef(null);
    const readingRef = useRef(null);

    const weight = weights.GATE_1;
    const setWeight = (v) => setWeights(prev => ({ ...prev, GATE_1: v }));
    // More than one scale enabled: show the scale selector and the Scales line on tickets
    const multiScale = enabledScales.length > 1;

    // Per-user scale lock: a restricted user only sees the scales on their allowed list.
    // The superadmin, and anyone with no list set, sees every enabled scale.
    const allowedList = (user?.allowedScales ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    const visibleScales = (user?.role === 'superadmin' || allowedList.length === 0)
        ? enabledScales
        : enabledScales.filter(id => allowedList.includes(id));
    const captureMultiScale = visibleScales.length > 1;

    // Set every scale we have seen to the same status value (used on error / disconnect / stop)
    const resetWeights = (value) => setWeights(prev => {
        const next = {};
        Object.keys(prev).forEach(k => { next[k] = value; });
        if (!next.GATE_1) next.GATE_1 = value;
        return next;
    });
    

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
                    resetWeights("");
                }
            };

            socket.onclose = () => {
                console.log("WebSocket Disconnected");
                resetWeights("Not connected");
                wsRef.current = null;
            };

            socket.onerror = () => {
                resetWeights("Not connected");
            };
    };

    const stopWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        resetWeights(null);
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

            // Which scales are enabled? Load each one's own decimal setting too
            const scales = await axios.get(`${BaseUrl}/scale`);
            const enabled = (scales.data ?? [])
                .filter(c => c.enabled)
                .map(c => c.scaleId)
                .sort();
            setEnabledScales(enabled.length ? enabled : ['GATE_1']);

            const sets = { GATE_1: adjustDecimal };
            for (const id of enabled) {
                if (id === 'GATE_1') continue;
                try {
                    const p = await axios.get(`${BaseUrl}/print-type`, { params: { scaleId: id } });
                    sets[id] = p.data.adjustDecimal;
                } catch (err) {
                    console.error(err);
                    sets[id] = 0;
                }
            }
            setDecimalSets(sets);
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
                    enabledScales={visibleScales}
                    multiScale={captureMultiScale}
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
                        multiScale={multiScale}

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
