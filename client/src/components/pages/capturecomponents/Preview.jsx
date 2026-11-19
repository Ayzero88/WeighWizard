import React, { useEffect, useState } from 'react'
import { FaBarcode, FaCar, FaCartPlus, FaClock, FaCog, FaComment, FaEnvelope, FaHardHat, FaIdBadge, FaLandmark, FaMapMarked, FaPen, FaPhone, FaPrint, FaProductHunt, FaSave, FaSignature, FaTimes, FaUser, FaUserAlt, FaWeight, FaWeightHanging } from 'react-icons/fa'
import ToPdf2 from '../../reuse/ToPdf2';
import DateTimeString from '../../reuse/DateTimeString';
import DisplayInfo from '../../reuse/DisplayInfo';
import axios from 'axios';
import { BaseUrl } from '../../reuse/BaseUrl';


const Preview = ({
        setShowExp, setShowPreview, capturedParams, ticketField, isToggle, setCapturedParams, showAlert, firstOperator,
        setTicketField, setShowCap, isPending, setIsPending,  operator, setFirstOperator, gate2Enabled}) => {

    const [showPrint, setShowPrint] = useState(false);
    const [owner, setOwner] = useState("");
    const [printType, setPrintType] = useState("");
    const [logo, setLogo] = useState(null);
    const [savedScale1, setSavedScale1] = useState("");

   const currentOperator =
    !firstOperator || operator === firstOperator
        ? operator
        : `FW: ${firstOperator}  SW: ${operator}`;
     
     useEffect(() => {
         const handleSetInfo = async()=>{
            await  DisplayInfo({setOwner: setOwner, setLogo: setLogo, setPrintType: setPrintType});
        };
        handleSetInfo();
     }, []);

    const handleSave = async (e) => {
                e.preventDefault();

                if (isToggle.standard && !capturedParams.istCap) {
                    showAlert("Error: No first weight data captured.", "error");
                    return;
                } else if (isToggle.straight && !capturedParams.grossCap) {
                    showAlert("Error: No gross weight data captured.", "error");
                    return;
                } else if (!ticketField.vehicleNo && isToggle.standard){

                    showAlert("Error: No vehicle No. data captured.", "error");
                    return;
                }else if (!ticketField.carrier && isToggle.standard){
                    showAlert("Error: No Carrier data captured.", "error");
                    return;
                }

                try {
                
                        const transaction = {
                        tid: ticketField.tid,
                        company: ticketField.client || "",
                        address: ticketField.address || "",
                        product: ticketField.product || "",
                        batchNo: ticketField.batchNo || "",
                        carrier: ticketField.carrier || "",
                        operator: currentOperator,
                        dest: ticketField.dest  || "",
                        tel: ticketField.tel || "",
                        vehicleNo: ticketField.vehicleNo || "",
                        unit: ticketField.unit,
                        remark: ticketField.remark || "",
                    
                        // weights
                        firstWeight: Number(capturedParams.istCap),
                        lastWeight: Number(capturedParams.secCap),
                        tareWeight: Number(capturedParams.tareCap),
                        grossWeight: Number(capturedParams.grossCap),
                        netWeight: Number(capturedParams.netCap),
                        fwDate: capturedParams.fDate,
                        swDate: capturedParams.sDate,
                        twDate: capturedParams.tDate,
                        nwDate: capturedParams.nDate,
                        gwDate: capturedParams.gDate,
                        capDate: capturedParams.capDate,

                        opsType: isToggle.standard ? "Standard" : "Straight",
                        scale1: capturedParams.scale1 || null,
                        scale2: capturedParams.scale2 || null
                    };
        
                        await axios.post(`${BaseUrl}/transactions`, transaction);
                        showAlert('Transaction saved successfully', "success");
                        setShowPrint(true);
                        
                } catch (error) {
                        console.error("Failed to send transaction details.", error);
                        showAlert("Failed to save transaction. Check backend connection and TID.", "error");
                }
   
    };

    const handleComplete = async () => {
   
        if (
            !ticketField.tid ||
            (capturedParams?.secCap === null ) ||
            (capturedParams?.secCap === 0 ) ||
            (capturedParams?.netCap == null) ||
            (capturedParams?.netCap === 0)
            ) {
                showAlert('Error: second weight value is required.', "error");
                return;
            }else{

                if (!ticketField.vehicleNo){

                    showAlert("Error: No vehicle No. data captured.", "error");
                    return;
                }

                   if (!ticketField.carrier){

                    showAlert("Error: No carrier data captured.", "error");
                    return;
                }
                try {
                    const transaction = {
                        tid: ticketField.tid,
                        lastWeight: capturedParams.secCap,
                        netWeight: capturedParams.netCap,
                        nwDate: capturedParams.nDate,
                        swDate: capturedParams.sDate,
                        scale2: capturedParams.scale2 || null,
                        operator: currentOperator
                    };

                    console.log("closing payload:", transaction);

                    await axios.post(`${BaseUrl}/transactions/finalTransaction`, transaction);
                    showAlert('Transaction saved successfully', "success");
                    setShowPrint(true);
                    setIsPending(false);
                    setFirstOperator(null);
                } catch (error) {
                console.error("Failed to complete transaction.", error);
                if (error.response?.status === 409) {
                    showAlert("This transaction was already completed at the other scale.", "error");
                } else {
                    showAlert("Failed to save transaction. Check backend connection and TID.", "error");
                }
    }
            };
    };

    const handleEdit = () => {
        setShowPreview(false);
        setShowExp(true);
    };

    const handleExit = ()=>{
        setTicketField({unit: ticketField.unit});
        setCapturedParams({});
        setShowPreview(false);
        setShowExp(true);
        setShowCap(true);
    };

    const handlePrint = () => {
        setTimeout(()=>{
        ToPdf2({ contentIdName: 'ticket' })
            .then((pdfData) => {
                // Create a new window or tab to display the PDF
                const newWindow = window.open();
                if (newWindow) {
                    const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
                    newWindow.location.href = pdfUrl;
                    setIsPending(false);
                    handleExit();
                } else {
                    console.error('Unable to open new window to display PDF.');
                }
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
            })

        }, 1000);
    };

    useEffect(() => {
        if (isPending && ticketField.tid && !capturedParams.scale1) {
            axios.get(`${BaseUrl}/transactions/filter-by-id/${ticketField.tid}`)
                .then(res => setSavedScale1(res.data?.scale1 || ""))
                .catch(err => console.error(err));
        }
    }, [isPending, ticketField.tid]);

    const firstScale = capturedParams.scale1 || savedScale1;
    const lastScale = capturedParams.scale1;

    const scaleLabel = (id) => id === 'GATE_1' ? 'Scale 1' : id === 'GATE_2' ? 'Scale 2' : '';
    const firstLabel = isToggle.standard ? 'First weight' : 'First capture';
    const lastLabel = isToggle.standard ? 'Second weight' : 'Final capture';

  return (
    <div className='ticket-wrap'>
         <div className='ticket-btn-wrap'>
           {!showPrint && <button className='btn-a' onClick={isPending ? handleComplete : handleSave}>
                <FaSave/> {isPending ? "Finish" : "Save"}
            </button>}
           {!showPrint && <button className='btn-b' onClick={handleEdit}>
                <FaPen/> Edit
            </button>}
         
           { showPrint && <button className='btn-c' onClick={handlePrint}>
                <FaPrint/> Print
            </button>}

            { (!isPending && showPrint) && <button className='btn-d' onClick={handleExit}>
                <FaTimes/> Exit
            </button>}
        </div>
        <div className='ticket' id='ticket'>
                <div className='title'>
                    <div className='logo'>
                        {logo ? <img src={logo} alt="Owner Logo" width="50px" /> : <p>Loading logo...</p>}
                    </div>
                    <h2>{owner.owner}</h2>
                    <h2>-</h2>
                    <h2>Weigh Transaction Ticket</h2>
                </div>
                <div className="owner-info">
                    <p><FaLandmark color='gray'/> <span>Address: </span>{owner.address}</p>
                    <p><FaPhone color='gray'/> <span>Tel:</span> {owner.tel}</p>
                    <p><FaEnvelope color='gray'/> <span>Email:</span> {owner.email}</p>
                </div>
                <div className='client-details'>
                    <h3><FaUser/> Client Details</h3>
                    <div className='content-container'>
                        <table className='table1'>
                                                    <tbody>
                                {[
                                    ticketField.tid && (
                                        <tr key="tid">
                                            <td className="td">
                                                <FaIdBadge color="gray" /> Transaction Id:
                                            </td>
                                            <td>{ticketField.tid}</td>
                                        </tr>
                                    ),

                                    ticketField.client && (
                                        <tr key="client">
                                            <td className="td">
                                                <FaUserAlt color="gray" /> Client Name:
                                            </td>
                                            <td>{ticketField.client}</td>
                                        </tr>
                                    ),

                                    ticketField.address && (
                                        <tr key="address">
                                            <td className="td">
                                                <FaLandmark color="gray" /> Address:
                                            </td>
                                            <td>{ticketField.address}</td>
                                        </tr>
                                    ),

                                    ticketField.tel && (
                                        <tr key="tel">
                                            <td className="td">
                                                <FaPhone color="gray" /> Telephone:
                                            </td>
                                            <td>{ticketField.tel}</td>
                                        </tr>
                                    ),

                                    ticketField.vehicleNo && (
                                        <tr key="vehicleNo">
                                            <td className="td">
                                                <FaCar color="gray" /> Vehicle Number:
                                            </td>
                                            <td>{ticketField.vehicleNo}</td>
                                        </tr>
                                    ),

                                    ticketField.dest && (
                                        <tr key="dest">
                                            <td className="td">
                                                <FaMapMarked color="gray" /> Destination:
                                            </td>
                                            <td>{ticketField.dest}</td>
                                        </tr>
                                    ),

                                    ticketField.product && (
                                        <tr key="product">
                                            <td className="td">
                                                <FaProductHunt color="gray" /> Product:
                                            </td>
                                            <td>{ticketField.product}</td>
                                        </tr>
                                    ),

                                    ticketField.carrier && (
                                        <tr key="carrier">
                                            <td className="td">
                                                <FaCartPlus color="gray" /> Carrier:
                                            </td>
                                            <td>{ticketField.carrier}</td>
                                        </tr>
                                    )
                                ].filter(Boolean)}
                            </tbody>

                        </table>
                    </div>

                </div>
                <h3><FaWeight/> Weigh Data</h3>
                <div className='client-details'>
                    <div className='content-container'>
                        <div>
                        
                        {ticketField.batchNo &&  <p><span> <FaBarcode color='gray'/> Batch Number:</span> {ticketField.batchNo}</p>}
                            <p><span> <FaWeight color='gray'/> Weigh Operation:</span> {isToggle.standard ? "Standard" : 'Straight'}</p>
                            {gate2Enabled && (firstScale || lastScale) && (
                                <p>
                                    <span> <FaWeight color='gray'/> Scales:</span>{' '}
                                    {firstScale && `${firstLabel}: ${scaleLabel(firstScale)}`}
                                    {firstScale && lastScale && ' · '}
                                    {lastScale && `${lastLabel}: ${scaleLabel(lastScale)}`}
                                </p>
                            )}
                        </div>
                        <table className='table2'>
                            <thead>
                                <tr>
                                    <th className='td'><FaCog color='gray'/> Operation</th>
                                    <th className='td'><FaWeightHanging color='gray'/> Weight</th>
                                    <th className='td'><FaClock color='gray'/> Date/Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    capturedParams.istCap && (
                                        <tr key="first">
                                            <td className="td">First Weight</td>
                                            <td>{capturedParams.istCap} {ticketField.unit}</td>
                                            <td>{DateTimeString({ dateTimeString: capturedParams.fDate })}</td>
                                        </tr>
                                    ),
                                    capturedParams.secCap && (
                                        <tr key="second">
                                            <td className="td">Second Weight</td>
                                            <td>{capturedParams.secCap} {ticketField.unit}</td>
                                            <td>{DateTimeString({ dateTimeString: capturedParams.sDate })}</td>
                                        </tr>
                                    ),
                                    capturedParams.netCap && (
                                        <tr key="net">
                                            <td className="td">Net Weight</td>
                                            <td>{capturedParams.netCap} {ticketField.unit}</td>
                                            <td>{DateTimeString({ dateTimeString: capturedParams.nDate })}</td>
                                        </tr>
                                    ),
                                    capturedParams.tareCap && (
                                        <tr key="tare">
                                            <td className="td">Tare Weight</td>
                                            <td>{capturedParams.tareCap} {ticketField.unit}</td>
                                            <td>{DateTimeString({ dateTimeString: capturedParams.tDate })}</td>
                                        </tr>
                                    ),
                                    capturedParams.grossCap && (
                                        <tr key="gross">
                                            <td className="td">Gross Weight</td>
                                            <td>{capturedParams.grossCap} {ticketField.unit}</td>
                                            <td>{DateTimeString({ dateTimeString: capturedParams.gDate })}</td>
                                        </tr>
                                    )
                                ].filter(Boolean)}
                            </tbody>

                        </table>
                    
                    
                    </div>
                </div>

                 {(ticketField.remark !== "" && ticketField.remark !== null )  && <h3><FaComment/> Remark</h3>}
                                {(ticketField.remark !== "" && ticketField.remark !== null )  && 
                                    <div className='client-details'>
                                    <div className='content-container'>
                                        
                                        <table className='table2'>
                                           
                                            <tbody>
                                               <tr>
                                                    <td>{ticketField.remark}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>}

                <div className='client-details'>
                    <h3><FaSignature/> Sign/Date</h3>
                    <div className='content-container'>
                        <table className='table1'>
                            <tbody>
                                <tr style={{height: '4rem'}}>
                                    <td className='td'><FaHardHat color='gray'/> Operator Name: <span>{currentOperator}</span></td>
                                    <td>Sign: </td>
                                    <td>Date: </td>

                                </tr>
                                <tr>
                                    <td className='td' style={{height: '4rem'}}> <FaCartPlus color='gray'/> Carrier Name: <span>{ticketField.carrier}</span></td>
                                    <td>Sign: </td>
                                    <td>Date: </td>

                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            
        </div>
        
 </div>
  )
}

export default Preview;