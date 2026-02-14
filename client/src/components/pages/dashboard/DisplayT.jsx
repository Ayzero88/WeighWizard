import React, { useEffect, useState } from 'react';
import { FaBarcode, FaCar, FaCartPlus, FaClock, FaCog, FaEnvelope, FaHardHat, FaIdBadge, FaLandmark, FaMapMarked, FaPhone, FaProductHunt, FaSignature, FaUser, FaUserAlt, FaWeight, FaWeightHanging } from 'react-icons/fa';
import DateTimeString from '../../reuse/DateTimeString';
import DisplayInfo from '../../reuse/DisplayInfo';

const DisplayT = ({ticketField, capturedParams}) => {
    const [owner, setOwner] = useState("");
    const [logo, setLogo] = useState(null);

    const handleSetInfo = async()=>{
       await  DisplayInfo({setOwner: setOwner, setLogo: setLogo});
    };

    useEffect(() => {
       handleSetInfo();
    }, []);

  return (
    <div className='ticket' id='ticket'>
                <div className='title'>
                    <div className='logo'>
                        {logo ? <img src={logo} alt="Owner Logo" width="50px" /> : <p>Loading logo...</p>}
                    </div>
                    <h2>{owner.owner}</h2>
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

                            {[ticketField && ticketField?.tid && 
                           ( <tr key="tid">
                                    <td className='td'><FaIdBadge color='gray'/> Transaction Id:</td>
                                    <td>{ticketField.tid}</td>
                                </tr>),

                                (ticketField && ticketField?.client &&   
                                <tr key="client">
                                    <td className='td'> <FaUserAlt color='gray'/> Client Name:</td>
                                    <td>{ticketField.client}</td>
                                </tr>),
                            (ticketField && ticketField?.address && 
                            <tr key="address">
                                    <td className='td'> <FaLandmark color='gray'/> Address:</td>
                                    <td>{ticketField.address}</td>
                                </tr>),
                            (ticketField && ticketField?.tel && 
                            <tr key="tel">
                                    <td className='td'> <FaPhone color='gray'/> Telephone:</td>
                                    <td>{ticketField.tel}</td>
                                </tr>),
                                (ticketField && ticketField?.vehicleNo && 
                                <tr key="vehicleNo">
                                    <td className='td'> <FaCar color='gray'/> Vehicle Number:</td>
                                    <td>{ticketField.vehicleNo}</td>
                                </tr>),
                            (ticketField && ticketField?.dest &&
                                <tr key="dest">
                                    <td className='td'><FaMapMarked color='gray'/> Destination:</td>
                                    <td>{ticketField.dest}</td>
                                </tr>),
                                (ticketField && ticketField?.product && 
                                <tr key="product">
                                    <td className='td'> <FaProductHunt color='gray'/> Product:</td>
                                    <td>{ticketField.product}</td>
                                </tr>),
                                (ticketField && ticketField?.carrier && 
                                <tr>
                                    <td className='td'> <FaCartPlus color='gray'/>Carrier:</td>
                                    <td>{ticketField.carrier}</td>
                                </tr>)
                               ].filter(Boolean)}  
                            </tbody>
                        </table>
                    </div>

                </div>
                <h3><FaWeight/> Weigh Data</h3>
                <div className='client-details'>
                    <div className='content-container'>
                        <div>
                        
                        {ticketField && ticketField?.batchNo &&  <p><span> <FaBarcode color='gray'/> Batch Number:</span> {ticketField.batchNo}</p>}
                            <p><span> <FaWeight color='gray'/> Weigh Operation:</span> {}</p>
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
                                {(!isNaN(capturedParams.istCap) && capturedParams.istCap !== "" && capturedParams.istCap !== null && capturedParams.istCap !== 0)  && 
                                <tr>
                                    <td className='td'>First Weight</td>
                                    <td>{capturedParams.istCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.fDate})}</td>
                                </tr>}
                            {(!isNaN(capturedParams.secCap) && capturedParams.secCap !== "" && capturedParams.secCap !== null && capturedParams.secCap !== 0 ) && 
                            <tr>
                                    <td className='td'>Second Weight</td>
                                    <td>{capturedParams.secCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.sDate})}</td>
                                </tr>}
                            {(!isNaN(capturedParams.netCap) && capturedParams.netCap !== "" && capturedParams.netCap !== null && capturedParams.netCap !== 0)  && 
                            <tr>
                                    <td className='td'>Net Weight</td>
                                    <td>{capturedParams.netCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.nDate})}</td>
                                </tr>}
                            {(!isNaN(capturedParams.tareCap) && capturedParams.tareCap !== "" && capturedParams.tareCap !== null && capturedParams.tareCap !== 0) && 
                            <tr>
                                    <td className='td'>Tare Weight</td>
                                    <td>{capturedParams.tareCap} {ticketField.unit}</td>
                                    <td>{DateTimeString({dateTimeString: capturedParams.tDate})}</td>
                                </tr>}
                                {(!isNaN(capturedParams.grossCap) && capturedParams.grossCap !== "" && capturedParams.grossCap !== null && capturedParams.grossCap !== 0) && 
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
  )
}

export default DisplayT
