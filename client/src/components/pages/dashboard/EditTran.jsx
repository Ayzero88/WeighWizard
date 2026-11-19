import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa';
import BtnSpinner from '../../reuse/BtnSpinner';
import { BaseUrl } from '../../reuse/BaseUrl';

const EditTran = ({transaction,transactions, setTransactions, handleExit, showAlert}) => {
        const [isLoading, setIsLoading] = useState(false);
        const [ticketField, setTicketField] = useState({
          tid: "",
          company: "",
          address: "",
          product: "",
          batchNo: "",
          carrier: "",
          operator: "",
          dest: "",
          tel: "",
          vehicleNo: "",
          unit: "Kg",
          remark: "",
        });

        const handleInputChange =(e) =>{
            const {name, value} = e.target;
            setTicketField({
                ...ticketField,
                [name]: value
            });
          };
    
        const handleUpdate = async (e) => {
            e.preventDefault();
            if (!ticketField || Object.keys(ticketField).length === 0) {
              showAlert("No transaction data to update.", "error");
              return;
            };

             const update =    {
              ...transaction,
                company: ticketField.company,
                address: ticketField.address,
                product: ticketField.product,
                batchNo: ticketField.batchNo,
                carrier: ticketField.carrier,
                operator: ticketField.operator,
                dest: ticketField.dest,
                tel: ticketField.tel,
                vehicleNo: ticketField.vehicleNo,
                unit: ticketField.unit,
                remark: ticketField.remark
              };

            const tranIndex = transactions.findIndex(tran => tran.tid === transaction.tid);
            const newTransactions = [...transactions];
            newTransactions[tranIndex] = update;

            setTransactions(newTransactions)
  
            try {
              setIsLoading(true);
              const response = await axios.put(`${BaseUrl}/transactions/update`, ticketField);
              setIsLoading(false);
              // Check if backend explicitly returned success
              if (response.data?.success || response.data) {
                showAlert(response.data?.message || "Transaction updated successfully.", "success"  );
                handleExit(); // return to table view
                
              } else {
                showAlert(response.data?.message || "Failed to update transaction. Please try again.", "error");
              }

            } catch (error) {
              console.error("Failed to update transaction:", error.response?.data || error.message);
              showAlert(error.response?.data?.message || "Failed to update transaction.", "error");
            }
      };

  
        useEffect(()=>{

            setTicketField(prev=>({
                ...prev,
                tid: Number(transaction.tid),
                company: transaction.company,
                address: transaction.address,
                product: transaction.product,
                batchNo: transaction.batchNo,
                carrier: transaction.carrier,
                operator: transaction.operator,
                dest: transaction.dest,
                tel: transaction.tel,
                vehicleNo: transaction.vehicleNo,
                unit: transaction.unit,
                remark: transaction.remark,
              }))

        }, []);
      
  return (
 
              <form>
                    <select className='unit' name='unit' value={ticketField.unit ?? "Kg"} onChange={handleInputChange}>
                                <option value="Kg">Kg</option>
                                <option value="g">g</option>
                                <option value="lb">lb</option>
                                <option value="oz">Oz</option>
                                <option value="T">Ton</option>
                    </select>
                  
                  <input placeholder='Company' name='company'  onChange={handleInputChange} maxLength={33} value={ticketField.company ?? ""}/>
                  <input placeholder='Address' name='address'  onChange={handleInputChange} maxLength={50} value={ticketField.address ?? ""}/>
                  <input placeholder='Product' name='product'  onChange={handleInputChange} maxLength={50} value={ticketField.product ?? ""}/>
                  <input placeholder='Batch No' name='batchNo'  onChange={handleInputChange} value={ticketField.batchNo ?? ""}/>
                  <input placeholder='Carrier' name='carrier'  onChange={handleInputChange} maxLength={50} value={ticketField.carrier ?? ""} />
                    <input placeholder='Destination' name='dest'  onChange={handleInputChange} maxLength={50}value={ticketField.dest ?? ""} />
                    <input placeholder='Telephone' name='tel'  onChange={handleInputChange} maxLength={12} value={ticketField.tel ?? ""} />
                    <input placeholder='Vehicle Number' name='vehicleNo'  onChange={handleInputChange} maxLength={12} value={ticketField.vehicleNo ?? ""}/>
                    <input placeholder='Remark' name='remark'  onChange={handleInputChange} maxLength={100} value={ticketField.remark ?? ""}/>
                    <div><button onClick={handleUpdate} disabled={isLoading}> {isLoading ? <BtnSpinner/> : <FaArrowUp/>}</button></div>
            </form>
    

  )
}

export default EditTran;
