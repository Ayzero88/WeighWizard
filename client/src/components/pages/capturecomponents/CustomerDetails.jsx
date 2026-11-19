import React, { useEffect} from 'react'
import { FaBrush, FaEye, FaUser } from 'react-icons/fa'
import Tooltip from '../../reuse/Tooltip'

const CustomerDetails = ({clearCapParams, clearTicketField, setShowCap, setTicketField,  isPending, showPreview,
            setIsPending, showStart, ticketField, showAlert, setShowPreview, setShowDashBoard, setShowExp, editTid}) => {

    
  // ---------- Input Handling ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketField(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchCurrentTid = async () => {
    // The server assigns the TID when the ticket is saved.
    // Only clear it when TID edit is off; a typed TID must stay as the operator typed it.
    if (!editTid) {
        setTicketField(prev => ({ ...prev, tid: "" }));
    }
  };

  const handleWipe = () => {

      setIsPending(false);
      clearCapParams();
      clearTicketField();
      if (!showStart) setShowCap(true);
      handleFetchCurrentTid();

  };

  
    // ---------- Transaction Handlers ----------
    const handleView = (e) => {
      e.preventDefault();
          if (!ticketField.client) { showAlert("company's Name is required", "error"); return; }
    if (editTid && !ticketField.tid) { showAlert("TID is required", "error"); return; }
      
      setShowPreview(true);
      setShowDashBoard(false);
      setShowExp(false);
    };

    useEffect(()=>{
      handleFetchCurrentTid();
    },[showPreview])
    

  return (
     <div className='print-type'>
                      <div className='sub-header'><h4> <FaUser/> Client Entry Field</h4></div>
                      <div className='save-btn'>
                          <Tooltip position='right' text='Preview Ticket'><button onClick={handleView}><FaEye/></button></Tooltip>
                          <Tooltip position='left' text='Clear Entry'><button onClick={handleWipe}><FaBrush/></button></Tooltip>
                      </div>

                  <form style={isPending ? {pointerEvents: 'none', cursor: 'default'}: {pointerEvents: 'auto', cursor: 'pointer'}}>
                  
                      <div>
                        <input type='text' inputMode='numeric' placeholder={editTid ? 'Transaction Id' : 'Auto'} name='tid'  onChange={handleInputChange} disabled={!editTid} value={ticketField.tid ?? ""}/>
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
                      <div>
                        <input  type='text' placeholder='Remark' name='remark'  onChange={handleInputChange} maxLength={100} value={ticketField.remark ?? ""}/>
                      </div>
                  
                  </form>
              </div>
  )
}

export default CustomerDetails
