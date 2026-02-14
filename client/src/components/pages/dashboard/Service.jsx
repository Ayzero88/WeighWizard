import React, { useState } from 'react';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import TTable from '../../reuse/TTable';
import { FaFileExport } from 'react-icons/fa';
import { FaBrush } from 'react-icons/fa';
import DisplayT from './DisplayT';
import { FaArrowLeft } from 'react-icons/fa';
import { FaPrint } from 'react-icons/fa';
import EditTran from './EditTran';
import DateRanger from '../../reuse/DateRanger';
import ToPdf2 from '../../reuse/ToPdf2';
import axios from 'axios';


const Service = () => {
    const [search, setSearch] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [transaction, setTransaction] = useState({});
    const [showDetails, setDetails] = useState({
       table: true,
       printPreview: false,
       editForm: false,
    });
    const [showAdvance, setShowAdvance] =  useState(false);
    const [capturedParams, setCapturedParams] =  useState({});
    const [ticketField, setTicketField] =  useState({});
  
    const handleShowAdvance = ()=>{
        setShowAdvance(prev=>!prev);
    };

    const handleSearchTransactions = async () => {
    if (!search.trim()) return; // prevent empty search

    try {
        const response = await axios.post(
        'http://localhost:8080/transactions/filter',
        { searchWord: search.trim() }
        );

        setTransactions(response.data); // assuming backend returns List<Transaction> directly

    } catch (error) {
        console.error("Failed to search transactions:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to send search params.");
    }
    };

    const clearTable = () =>{

        if(transactions.length > 0){
        setTransactions([]);
        setSearch("");
        };

    };

    const viewTransaction = (tid)=>{
            
            const transactionToView = transactions.find((transaction) => transaction.tid === tid);
            if(transactionToView){

                const ticket = {
                tid: transactionToView.tid,
                client: transactionToView.company,
                address: transactionToView.address,
                product: transactionToView.product,
                batchNo: transactionToView.batchNo,
                carrier: transactionToView.carrier,
                operator: transactionToView.operator,
                dest: transactionToView.dest,
                tel: transactionToView.tel,
                vehicleNo: transactionToView.vehicleNo,
                unit: transactionToView.unit,
                };
                const captured = {
                istCap: transactionToView.firstWeight,
                secCap: transactionToView.lastWeight,
                tareCap: transactionToView.tareWeight,
                netCap: transactionToView.netWeight, 
                grossCap: transactionToView.grossWeight,
                fDate: transactionToView.fwDate,
                sDate: transactionToView.swDate,
                tDate: transactionToView.twDate,
                gDate: transactionToView.gwDate,
                nDate: transactionToView.nwDate,
                capDate: transactionToView.capdate,
                };
            
            setTicketField(ticket);
            setCapturedParams(captured);
            setDetails({printPreview: true});
            };
    };

    const handleExit =()=>{
        setDetails({table: true});
    };

    const handleEdit = (tid)=>{
        if(transactions.length > 0){
        const transactionToEdit = transactions.find((transaction) => transaction.tid === tid);
        setTransaction(transactionToEdit);
        setDetails({editForm: true});
    }else{
        alert("Transaction does not exist!")
    }
    };

    const handleDelete = async (tid) => {
    try {
        const response = await axios.delete(`http://localhost:8080/transactions/delete/${tid}`);

        setTransactions(prev =>
        prev.filter(t => t.tid !== tid)
        );

        alert(response.data?.message || 'Transaction deleted successfully');

    } catch (error) {
        console.error(error);
        alert('Failed to delete transaction.');
    }
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
            } else {
                console.error('Unable to open new window to display PDF.');
            }
        })
        .catch((error) => {
            console.error('Error generating PDF:', error);
        })

    }, 1000);
    };

    const handleExport = async () => {
    try {
        const response = await axios.get('http://localhost:8080/transactions/export', {
        responseType: 'blob', // important
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transactions.xlsx'); 
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Failed to export transactions", error);
    }
    };



  return (
    <div  className='service'>
        {(showAdvance && showDetails.table) &&  <h4> <FaFilter/> Filter by Dates [ Start, End ]</h4>}
       <div className='search'>
           {(!showAdvance && showDetails.table) &&  <input type='text' placeholder='Find Transactions (TID, Vehicle No, Company Name)' name='search' value={search} onChange={(e)=>setSearch(e.target.value)}/>}
           
            {(showAdvance && showDetails.table ) && <DateRanger setTransactions={setTransactions} />}

                {(!showAdvance && showDetails.table) && <button onClick={handleSearchTransactions}> <FaSearch size={17}/> </button>}
                {showDetails.table && <button onClick={handleShowAdvance}>{showAdvance ? <FaTimes color='red' size={17}/> : <FaFilter color='gray' size={17} />}</button>}
                {showDetails.table && <button onClick={handleExport}>{<FaFileExport color="green" size={17}/>}</button>}
                {(showDetails.table && transactions && transactions.length > 0 ) && <button onClick={clearTable}>{<FaBrush color="darkred" size={17}/>}</button>}
                {(showDetails.printPreview) && <button onClick={handleExit}>{<FaArrowLeft color="black" size={17}/>}</button>}
                {(showDetails.printPreview) && <button onClick={handlePrint}>{<FaPrint color="black" size={17}/>}</button>}
       </div>

      {showDetails.table && 
      <div className='result'>
             {(transactions && transactions.length > 0) ? <TTable transactions={transactions} viewTransaction={viewTransaction} handleEdit={handleEdit} handleDelete={handleDelete} /> : <p style={{color: "gray"}}>Find transactions ... </p>}    
       </div>}
       {showDetails.printPreview && <DisplayT capturedParams={capturedParams}  ticketField={ticketField}/>}

       {showDetails.editForm && 
       <div className='edit-wrap'>
        <div className='exit'><p>TID: {transaction.tid}</p><FaTimes onClick={()=>setDetails({table: true})} color='red' /></div>
          <EditTran  transaction={transaction} handleExit={handleExit}/>
       </div>}
    </div>
  )
}

export default Service;