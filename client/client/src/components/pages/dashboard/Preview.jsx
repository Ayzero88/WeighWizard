import React, { useState } from 'react'
import { FaPen, FaPrint, FaSave, FaSignature, FaUser, FaWeight } from 'react-icons/fa'
import ToPdf2 from '../../reuse/ToPdf2';
import DateTimeString from '../../reuse/DateTimeString';


const Preview = ({setShowExp, setShowPreview, capturedParams, ticketField, isToggle, setCapturedParams, setTicketField}) => {
    const [showPrint, setShowPrint] = useState(false);

    const handleSave = async(e) =>{
        e.preventDefault();
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
            alert(`Response: ${data.message || 'No message received'}`);
            setShowPrint(true);
            
        } catch (error) {
            console.error("Failed to send transaction details.");
            alert(`Failed to save transaction Details. Check that TID has not been used before. `);     
        };

      
    };

    const handleEdit = () => {
        setShowPreview(false);
        setShowExp(true);
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
                      setTicketField({});
                      setCapturedParams({});
                      setShowPreview(false);
                      setShowExp(true);
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
           {!showPrint && <button className='btn-a' onClick={handleSave}>
                <FaSave/> Save
            </button>}
           {!showPrint && <button className='btn-b' onClick={handleEdit}>
                <FaPen/> Edit
            </button>}
         
           { showPrint && <button className='btn-c' onClick={handlePrint}>
                <FaPrint/> Print
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
                                    <td className='td'>Transaction Id:</td>
                                    <td>{ticketField.tid}</td>
                                </tr>}
                                {ticketField.client &&   
                                <tr>
                                    <td className='td'>Client Name:</td>
                                    <td>{ticketField.client}</td>
                                </tr>}
                            {ticketField.address && 
                            <tr>
                                    <td className='td'>Address:</td>
                                    <td>{ticketField.address}</td>
                                </tr>}
                            {ticketField.tel && 
                            <tr>
                                    <td className='td'>Telephone:</td>
                                    <td>{ticketField.tel}</td>
                                </tr>}
                                {ticketField.email && 
                                <tr>
                                    <td className='td'>Vehicle Number:</td>
                                    <td>{ticketField.vehicleNo}</td>
                                </tr>}
                            {ticketField.dest &&
                                <tr>
                                    <td className='td'>Destination:</td>
                                    <td>{ticketField.dest}</td>
                                </tr>}
                                {ticketField.product && 
                                <tr>
                                    <td className='td'>Product:</td>
                                    <td>{ticketField.product}</td>
                                </tr>}
                                {ticketField.carrier && 
                                <tr>
                                    <td className='td'>Carrier:</td>
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
                        
                        {ticketField.batchNo &&  <p><span> Batch Number:</span> {ticketField.batchNo}</p>}
                            <p><span> Weigh Operation:</span> {isToggle.standard ? "Standard" : 'Straight'}</p>
                        </div>
                        <table className='table2'>
                            <thead>
                                <tr>
                                    <th className='td'>Operation</th>
                                    <th className='td'>Weight</th>
                                    <th className='td'>Date</th>
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
                                <tr>
                                    <td className='td'>Operator Name:</td>
                                    <td>Sign: </td>
                                    <td>Date: </td>

                                </tr>
                                <tr>
                                    <td className='td'>Carrier Name:</td>
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