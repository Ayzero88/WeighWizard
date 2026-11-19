import React from 'react';
import {FaCircle, FaEye, FaTrash, FaPenFancy} from "react-icons/fa";
import FormatDateTime from './FormatDateTime';

const TTable = ({user, transactions, viewTransaction, handleEdit, handleDelete, canEdit, canDelete}) => {
  
  return (
    <table className='table2'>
      <thead>
        <tr>
          <th>TID</th>
          <th>Name</th>
          <th>Address</th>
          <th>Product</th>
          <th>Vehicle/No</th>
          <th>Transaction Date</th>
          <th>Status</th>
          <th>Alt</th>
        </tr>
      </thead>
      <tbody>
       

        {transactions && transactions.length > 0 && transactions.map((transact, index) =>{
            
            const formattedDateTime_cap = FormatDateTime({isoString: transact.capDate});
        
            const statusColor = (transact.opsType === "Standard" && !transact.netWeight) ? "orange": "lime"
            
            return(
                    <tr key={index}>

                                <td>{transact.tid}</td>
                                <td>{transact.company}</td>
                                <td>{transact.address}</td>
                                <td>{transact.product}</td>
                                <td>{transact.vehicleNo}</td>
                                <td>{formattedDateTime_cap}</td>
                                <td ><div style={{display: 'flex', alignItems: 'center', justifyContent: "center"}}><FaCircle size={8} color={statusColor}/></div></td>
                                <td >
                                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: "center"}}>
                                        <FaEye cursor="pointer" color='#007BFF'  onClick={()=>viewTransaction(transact.tid)}/>
                                        {canEdit && <FaPenFancy cursor="pointer" color='gray'  onClick={()=>handleEdit(transact.tid)}/>}
                                        {canDelete && <FaTrash cursor="pointer" color='red' onClick={()=>handleDelete(transact.tid)}/>}
                                    </div>
                                    
                                </td>
                    </tr>
            )
        })}
      
      </tbody>
    </table>
  );
};

export default TTable;
