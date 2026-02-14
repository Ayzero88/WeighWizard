import React, { useEffect, useState } from 'react'
import { FaBarcode, FaCar, FaCartPlus, FaClock, FaCog, FaEnvelope, FaHardHat, FaIdBadge, FaLandmark, FaMapMarked, FaPen, FaPhone, FaPrint, FaProductHunt, FaSave, FaSignature, FaTimes, FaUser, FaUserAlt, FaWeight, FaWeightHanging } from 'react-icons/fa'
import ToPdf2 from '../../reuse/ToPdf2';
import DateTimeString from '../../reuse/DateTimeString';
import DisplayInfo from '../../reuse/DisplayInfo';
import axios from 'axios';


const Preview = ({
        setShowExp, setShowPreview, capturedParams, ticketField, isToggle, setCapturedParams, 
        setTicketField, setShowCap, isPending, setIsPending, handleFetchTransactions}) => {
    const [showPrint, setShowPrint] = useState(false);
    const [owner, setOwner] = useState("");
    const [logo, setLogo] = useState(null);

   
     
     useEffect(() => {
         const handleSetInfo = async()=>{
            await  DisplayInfo({setOwner: setOwner, setLogo: setLogo});
        };
        handleSetInfo();
     }, []);


    const handleSave = async (e) => {
            e.preventDefault();
            if (isToggle.standard && !capturedParams.istCap) {
                alert("Error: No weight data captured.");
                return;
            } else if (isToggle.straight && !capturedParams.grossCap) {
                alert("Error: No weight data captured.");
                return;
            }

            try {
                const transaction = {
                tid: ticketField.tid,
                company: ticketField.client,
                address: ticketField.address,
                product: ticketField.product,
                batchNo: ticketField.batchNo,
                carrier: ticketField.carrier,
                operator: ticketField.operator,
                dest: ticketField.dest,
                tel: ticketField.tel,
                vehicleNo: ticketField.vehicleNo,
                unit: ticketField.unit,
                
                // weights
                firstWeight: Number(capturedParams.istCap),
                lastWeight: Number(capturedParams.secCap),
                tareWeight: Number(capturedParams.tareCap),
                grossWeight: Number(capturedParams.grossCap),
                netWeight: Number(capturedParams.netCap),
                fwDate: capturedParams.fDate,
                swDate: capturedParams.sDate,
                nwDate: capturedParams.nDate,
                gwDate: capturedParams.gDate,
                capDate: capturedParams.capDate,

                opsType: isToggle.standard ? "Standard" : "Straight"
            };


                const { data } = await axios.post('http://localhost:8080/transactions', transaction);
                alert(data.message || 'Transaction saved successfully');
                setShowPrint(true);
            } catch (error) {
                console.error("Failed to send transaction details.", error);
                alert("Failed to save transaction. Check backend connection and TID.");
            }
    };

    const handleComplete = async () => {
        if (
            !ticketField.tid ||
            capturedParams.secCap == null ||
            capturedParams.netCap == null
            ) {
                alert('Error. The second weight value is needed to complete this transaction.');
                return;
            }
        try {
            const transaction = {
                tid: ticketField.tid,
                lastWeight: capturedParams.secCap,
                netWeight: capturedParams.netCap,
                nwDate: capturedParams.nDate,
                swDate: capturedParams.sDate,
            };

            const { data } = await axios.post('http://localhost:8080/transactions/finalTransaction', transaction);
            alert(data.message || 'Transaction completed successfully');
            setShowPrint(true);
            setIsPending(false);
        } catch (error) {
            console.error("Failed to complete transaction.", error);
            alert("Failed to complete transaction. Check backend connection and TID.");
        }
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
        handleFetchTransactions();
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
                    handleFetchTransactions();
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
                <div className='client-details'>
                    <h3><FaSignature/> Sign/Date</h3>
                    <div className='content-container'>
                        <table className='table1'>
                            <tbody>
                                <tr style={{height: '4rem'}}>
                                    <td className='td'><FaHardHat color='gray'/> Operator Name:</td>
                                    <td>Sign: </td>
                                    <td>Date: </td>

                                </tr>
                                <tr>
                                    <td className='td' style={{height: '4rem'}}> <FaCartPlus color='gray'/> Carrier Name:</td>
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

export default Preview