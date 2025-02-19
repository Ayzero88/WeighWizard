import React, { useState } from 'react'
import { FaBarcode, FaCar, FaCartPlus, FaClock, FaCog, FaHardHat, FaIdBadge, FaLandmark, FaMapMarked, FaPen, FaPhone, FaPrint, FaProductHunt, FaSave, FaSignature, FaTimes, FaUser, FaUserAlt, FaWeight, FaWeightHanging } from 'react-icons/fa'
import ToPdf2 from '../../reuse/ToPdf2';
import DateTimeString from '../../reuse/DateTimeString';


const Preview = ({
        setShowExp, setShowPreview, capturedParams, ticketField, isToggle, setCapturedParams, 
        setTicketField, setShowCap, isPending, setIsPending, handleFetchTransactions}) => {
    const [showPrint, setShowPrint] = useState(false);

    const handleSave = async(e) =>{
        e.preventDefault();
        if(isToggle.standard && !capturedParams.istCap){
            alert("Eror: No weight data captured.");
            return;
        }else if(isToggle.straight && !capturedParams.grossCap){
            alert("Error: No weight data captured.");
            return;
        };
        try {
            const transaction = {weighData: capturedParams, clientData: ticketField, ops_type:isToggle.standard ? "Standard" : 'Straight' };
            const response = await fetch('http://localhost:5000/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });

            if(!response.ok){
                throw new Error('Failed to save transaction:', response.status);
            };

            const data = await response.json();
            alert(`${data.message || 'No message received'}`);
            setShowPrint(true);
            
        } catch (error) {
            console.error("Failed to send transaction details.");
            alert(`Failed to save transaction Details. Check that TID has not been used before. `);     
        }
      
    };

    const handleComplete = async() =>{
        if(!ticketField.tid || !capturedParams.secCap || ! capturedParams.netCap){
            alert('Error. The second weight value is needed to complete this transaction.');
            return;
        };
        //complete_transaction
        const transaction = {
            tid: ticketField.tid,
            last_weight: capturedParams.secCap ,
            net_weight: capturedParams.netCap
        };

        try {
            const response = await fetch('http://localhost:5000/complete_transaction' , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });

            if(!response.ok){
                throw new Error('Failed to complete transaction:', response.status);
            };

            const data = await response.json();
            alert(`Response: ${data.message || 'No message received'}`);
            setShowPrint(true);
            setIsPending(false);
        } catch (error) {
            console.error("Failed to complete transaction.");
            alert(`Failed to complete transaction. Please check TID and weights.`);
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
                    <h2>Weigh Transaction Ticket</h2>
                </div>
                <div className='client-details'>
                    <h3><FaUser/> Client Details</h3>
                    <div className='content-container'>
                        <table className='table1'>
                            <tbody>

                            {ticketField.tid && 
                            <tr>
                                    <td className='td'><FaIdBadge color='gray'/> Transaction Id:</td>
                                    <td>{ticketField.tid}</td>
                                </tr>}
                                {ticketField.client &&   
                                <tr>
                                    <td className='td'> <FaUserAlt color='gray'/> Client Name:</td>
                                    <td>{ticketField.client}</td>
                                </tr>}
                            {ticketField.address && 
                            <tr>
                                    <td className='td'> <FaLandmark color='gray'/> Address:</td>
                                    <td>{ticketField.address}</td>
                                </tr>}
                            {ticketField.tel && 
                            <tr>
                                    <td className='td'> <FaPhone color='gray'/> Telephone:</td>
                                    <td>{ticketField.tel}</td>
                                </tr>}
                                {ticketField.vehicleNo && 
                                <tr>
                                    <td className='td'> <FaCar color='gray'/> Vehicle Number:</td>
                                    <td>{ticketField.vehicleNo}</td>
                                </tr>}
                            {ticketField.dest &&
                                <tr>
                                    <td className='td'><FaMapMarked color='gray'/> Destination:</td>
                                    <td>{ticketField.dest}</td>
                                </tr>}
                                {ticketField.product && 
                                <tr>
                                    <td className='td'> <FaProductHunt color='gray'/> Product:</td>
                                    <td>{ticketField.product}</td>
                                </tr>}
                                {ticketField.carrier && 
                                <tr>
                                    <td className='td'> <FaCartPlus color='gray'/>Carrier:</td>
                                    <td>{ticketField.carrier}</td>
                                </tr>}
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
                                {capturedParams.istCap && 
                                <tr>
                                    <td className='td'>First Weight</td>
                                    <td>{capturedParams.istCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.fDate})}</td>
                                </tr>}
                            {capturedParams.secCap && 
                            <tr>
                                    <td className='td'>Second Weight</td>
                                    <td>{capturedParams.secCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.sDate})}</td>
                                </tr>}
                            {capturedParams.netCap && 
                            <tr>
                                    <td className='td'>Net Weight</td>
                                    <td>{capturedParams.netCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.nDate})}</td>
                                </tr>}
                            {capturedParams.tareCap && 
                            <tr>
                                    <td className='td'>Tare Weight</td>
                                    <td>{capturedParams.tareCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.tDate})}</td>
                                </tr>}
                                {capturedParams.grossCap && 
                                <tr>
                                    <td className='td'>Gross Weight</td>
                                    <td>{capturedParams.grossCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.gDate})}</td>
                                </tr>}
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