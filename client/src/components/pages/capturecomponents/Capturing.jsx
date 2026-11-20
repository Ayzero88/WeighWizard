import { useState } from 'react';
import { FaCamera, FaPlay, FaStop, FaWeight } from 'react-icons/fa'


const Capturing = ({handleInputChange, showStart, setShowStart, clearCapParams, clearTicketField, weight: weightProp, setWeight, showStop, 
  setShowStop, showTare, setShowTare, decimalSet: decimalSetProp, decimalSets, weights, enabledScales, isToggle, setShowCap, showCap, showAlert, isPending, setIsPending, setTicketField, 
  capturedParams, setCapturedParams, ticketField, wsRef, tareRef, readingRef, startWebSocket, stopWebSocket}) => {

      const [activeGate, setActiveGate] = useState(() => {
    try { return localStorage.getItem('activeGate') || 'GATE_1'; } catch { return 'GATE_1'; }
  });

  const selectGate = (g) => {
    setActiveGate(g);
    try { localStorage.setItem('activeGate', g); } catch {}
  };

  // The scale being captured from. Everything below keeps using `weight` and `decimalSet`.
  const scales = enabledScales && enabledScales.length ? enabledScales : ['GATE_1'];
  const gate = scales.includes(activeGate) ? activeGate : scales[0];
  const weight = weights ? (weights[gate] ?? null) : weightProp;
  const decimalSet = decimalSets?.[gate] ?? decimalSetProp;

 
      // ---------- Capture Handlers ----------
  const handleStart = () => {
    if (!isToggle.standard && !isToggle.straight) {
      showAlert("Error: No weigh operation type was set.", "error");
      return;
    }

    startWebSocket();

    if (readingRef.current?.innerText !== "Not Connected") {
      setShowCap(true);
      setShowTare(true);
      setShowStop(true);
      setShowStart(false);
    }
  };


  const handleStop = () => {
    stopWebSocket();
    setShowStop(false);
    setShowStart(true);
    setShowCap(false);
    clearCapParams();

    if (!isPending) {
      setShowTare(true);
      clearCapParams();
      setShowTare(false);
    } else {
      setIsPending(false);
      clearTicketField();
      setTicketField(prev => ({ ...prev, unit: ticketField.unit }));
    }
  };


 const formatWeight = (value, decimals) => {
        if (value === null || isNaN(value)) return "Not Connected";
        const safeDecimals = Math.min(Math.max(decimals, 0), 4);
        return Number(value).toFixed(safeDecimals);
  };


  const handleStraightCapture = () => {
  if (!isToggle.straight) {
    showAlert("Weigh Operation was not set.", "error");
    return;
  }

  setShowCap(false);
  setShowTare(false);

  setCapturedParams(prevCap => {
    if (!prevCap.istCap && !prevCap.tareCap) {
      return { ...prevCap, grossCap: formatWeight(weight, decimalSet), capDate: new Date().toISOString(), gDate: new Date().toISOString(), scale1: gate };
    }

    if (prevCap.tareCap) {
      const firstCap = Number(formatWeight(weight, decimalSet) ?? 0);
      const prevTare = Number(prevCap.tareCap ?? 0);
      const netCapture = formatWeight(firstCap - prevTare, decimalSet);
      const grossCapture = formatWeight(Number(netCapture) + prevTare, decimalSet);
      if (netCapture === "0") {
        showAlert("Net Weight can not be zero.", "error");
        return prevCap;
      } else if (grossCapture === 0) {
        showAlert("gross Weight can not be zero.", "error");
        return prevCap;
      } else {
        return { ...prevCap, grossCap: grossCapture, netCap: netCapture, gDate: new Date().toISOString(), nDate: new Date().toISOString(), scale2: gate };
      }
    }

    return prevCap;
  });
  };

  const handleStandardCapture = () => {
    if (!isToggle.standard) { showAlert("Weigh Operation was not set.", "error"); return; }

    if (capturedParams.istCap && !capturedParams.secCap) setShowCap(false);

    setCapturedParams(prevCap => {
      if (!prevCap.istCap && !prevCap.secCap) {
        return { ...prevCap, istCap: formatWeight(weight, decimalSet), capDate: new Date().toISOString(), fDate: new Date().toISOString(), scale1: gate };
      }

      if (prevCap.istCap && !prevCap.secCap) {
        const netCapture = formatWeight(weight - prevCap.istCap, decimalSet);
        if (netCapture === "0") {
          showAlert("Net Weight can not be zero.", "error");
          return prevCap;
        } else {
          return { ...prevCap, secCap: formatWeight(weight, decimalSet), netCap: Math.abs(netCapture), sDate: new Date().toISOString(), nDate: new Date().toISOString(), scale2: gate };
        }
      }

      return prevCap;
    });
  };

 const handleTare = () => {
  if (!capturedParams.istCap && !capturedParams.tareCap) setShowTare(false);

  setCapturedParams(prevCap => {
    if (!prevCap.istCap && !prevCap.tareCap) {
      return {
        ...prevCap,
        tareCap: formatWeight(weight, decimalSet),
        capDate: new Date().toISOString(),
        tDate: new Date().toISOString(),
        ...(prevCap.grossCap ? { scale2: gate } : { scale1: gate })
      };
    }
    return prevCap;
  });
 };


  return (
    <div className='capturing-wrap'>
                    
                    <div className='capturing'>
                        <div className='sub-header'>
                            <h4> <FaCamera/> Capture </h4>
                            <h4> <FaWeight/> {isToggle.standard ? "Standard" : isToggle.straight ? 'Straight' : null} </h4>
                        </div>
                    {scales.length > 1 && weights && (
                    <div className='gate-select' style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {scales.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => selectGate(g)}
                          style={{ fontWeight: gate === g ? 'bold' : 'normal', opacity: gate === g ? 1 : 0.6 }}
                        >
                          Scale {g.replace('GATE_', '')}
                        </button>
                      ))}
                    </div>
                  )}
                        <div className='reading-box'>
                            <h3 ref={readingRef} style={{color: weight !== null && !isNaN(weight) ? weight < 0 ? "red" : "green" : "gray"}}>
                            {weight !== null && !isNaN(weight) ? formatWeight(weight, decimalSet) : "Not Connected"}
                            </h3>

                            {weight !== null && !isNaN(weight) && 
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
                        {((capturedParams?.grossCap || capturedParams?.tareCap  || capturedParams?.istCap)) &&
                        <div className='cap-res'>
                            {(!isNaN(capturedParams?.istCap) && capturedParams?.istCap !== "" && capturedParams?.istCap !== null && capturedParams.istCap !== 0)  && <> <p><span>Ist Capture:&nbsp;&nbsp;&nbsp;&nbsp;</span> {capturedParams.istCap}{ticketField.unit}</p>
                            <hr/></>}
                            {(!isNaN(capturedParams?.secCap) && capturedParams?.secCap !== "" && capturedParams?.secCap !== null && capturedParams.secCap !== 0 ) && <> <p><span>2nd Capture:&nbsp;&nbsp;</span> {capturedParams.secCap}{ticketField.unit}</p>
                            <hr/></>}
                            {(!isNaN(capturedParams?.tareCap) && capturedParams?.tareCap !== "" && capturedParams?.tareCap !== null && capturedParams.tareCap !== 0) && <> <p><span>Tare Capture:&nbsp;&nbsp;</span>{capturedParams.tareCap}{ticketField.unit}</p>
                            <hr/></>}
                            {(!isNaN(capturedParams?.netCap) && capturedParams?.netCap !== "" && capturedParams?.netCap !== null && capturedParams.netCap !== 0) && <> <p><span>Net Capture: &nbsp;&nbsp;</span>    {capturedParams.netCap}{ticketField.unit} </p>
                            <hr/></>}
                            {(!isNaN(capturedParams?.grossCap) && capturedParams?.grossCap !== "" && capturedParams?.grossCap !== null && capturedParams.grossCap !== 0) && <p><span>Gross Capture:</span> {capturedParams.grossCap}{ticketField.unit} </p>}
                        </div>}

                    </div>
            </div>
  )
}

export default Capturing
