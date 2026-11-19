import React, { useState } from 'react';
import { FaFilter, FaTimes, FaSearch, FaDatabase} from 'react-icons/fa';
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
import Backup from './Backup';
import Spinner from '../../reuse/Spinner';
import Tooltip from '../../reuse/Tooltip';
import { FiUser } from 'react-icons/fi';
import CreateLogin from '../../auth/CreateLogin';
import RequireRole from '../../auth/RequiredRole';
import { RULES, hasRole } from '../../auth/roles';
import { BaseUrl } from '../../reuse/BaseUrl';


const Service = ({showAlert, showConfirmAlert, user, gate2Enabled}) => {
    const [search, setSearch] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [transaction, setTransaction] = useState({});
    const [showDetails, setDetails] = useState({
       table: true,
       printPreview: false,
       editForm: false,
       showBackup: false,
       showCreateUser: false
    });
    const [showAdvance, setShowAdvance] =  useState(false);
    const [capturedParams, setCapturedParams] =  useState({});
    const [ticketField, setTicketField] =  useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);
    const [isLoading4, setIsLoading4] = useState(false);
    const [isLoading5, setIsLoading5] = useState(false);

    // What this user may do (the rules live in auth/roles.js)
    const canEdit = hasRole(user, RULES.editTicket);
    const canDelete = hasRole(user, RULES.deleteTicket);

    const handleShowAdvance = ()=>{
        setShowAdvance(prev=>!prev);
    };

    const handleSearchTransactions = async () => {
    if (!search.trim()) return; // prevent empty search

    try {
        setIsLoading2(true);
        const response = await axios.post(
        `${BaseUrl}/transactions/filter`,
        { searchWord: search.trim() }
        );

        setTransactions(response.data); // assuming backend returns List<Transaction> directly
        setIsLoading2(false);

    } catch (error) {
        console.error("Failed to search transactions:", error.response?.data || error.message);
        showAlert(error.response?.data?.message || "Failed to send search params.", "error");
        setIsLoading2(false);
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
                remark: transactionToView.remark,
                opsType: transactionToView.opsType
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
        if(!canEdit){
            showAlert("You are not allowed to edit transactions.", "error");
            return;
        }
        if(transactions.length > 0){
        const transactionToEdit = transactions.find((transaction) => transaction.tid === tid);
        setTransaction(transactionToEdit);
        setDetails({editForm: true});
    }else{
        showAlert("Transaction does not exist!", "error")
    }
    };

    const handleDelete = async (tid) => {
    if(!canDelete){
        showAlert("Only a superadmin can delete transactions.", "error");
        return;
    }

    try {
        setIsLoading(true);

        const response = await axios.delete(
            `${BaseUrl}/transactions/delete/${tid}`
        );

        setTransactions(prev =>
            prev.filter(t => t.tid !== tid)
        );

        showAlert(
            response.data.message || 'Transaction deleted successfully',
            'success'
        );

    } catch (error) {
        console.error(error);
        showAlert(
            error.response?.data?.message || 
            'Failed to delete transaction.',
            'error'
        );
    } finally {
        setIsLoading(false);
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

    const confirmExport = () => {
        showConfirmAlert(
            "Export all transactions?",
            "info",
            handleExport
        );
    };

    const confirmExportDel = () => {
        showConfirmAlert(
            "Export all deleted transactions?",
            "info",
            handleExportDelTransaction
        );
    };

    const handleExport = async () => {
        try {
            setIsLoading4(true);
            const response = await axios.get(`${BaseUrl}/transactions/export`, {
            responseType: 'blob', // important
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.xlsx'); 
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsLoading4(false);
        } catch (error) {
        console.error("Failed to export transactions", error);
        if (error.response?.status === 404) {
                showAlert("There are no transactions to export.", "info");
        } else {
            showAlert("Failed to export transactions.", "error");
        }
        setIsLoading4(false);
    }
 };

    const handleExportDelTransaction = async () => {
        try {
            setIsLoading5(true);
            const response = await axios.get(`${BaseUrl}/transactions/export-delete`, {
            responseType: 'blob', // important
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'deleted_transactions.xlsx'); 
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsLoading5(false);
        } catch (error) {
            console.error("Failed to export deleted transactions", error);
            console.log(error.response?.status)
            if (error.response?.status === 404) {
                showAlert("There are no deleted transactions to export.", "info");
            } else {
                showAlert("Failed to export deleted transactions.", "error");
            }
            setIsLoading5(false);
        }
    };

    const handleShowBackUp = () =>{
        setDetails({showBackup: true});
    };

    const handleShowCreateUser = ()=>{
        setDetails({showCreateUser: true});
    };

  return (
    <>
       {showDetails.showBackup && 
        (
            <RequireRole allowedRoles={RULES.backup} showAlert={showAlert} setComp={setDetails} comp='table'>
                <Backup setDetails={setDetails} showAlert={showAlert} showConfirmAlert={showConfirmAlert} user={user} />
            </RequireRole>
            )
       
       }
       {!showDetails.showBackup && !showDetails.showCreateUser &&
       <div  className='service'>
            {(showAdvance && showDetails.table) && <h4>  <FaFilter/> Filter by Dates [ Start, End ]</h4>}
        <div className='search'>
            {(!showAdvance && showDetails.table) &&  <input type='text' placeholder='Find Transactions (Vehicle No, Company Name)' name='search' value={search} onChange={(e)=>setSearch(e.target.value)}/>}
            
                <div className='service-btn'>
                    {(showAdvance && showDetails.table ) && <DateRanger setTransactions={setTransactions} showAlert={showAlert} setIsLoading3={setIsLoading3}/>}
                    {(!showAdvance && showDetails.table) && <FaSearch size={17} onClick={handleSearchTransactions} cursor='pointer'/>}
                     {(showDetails.table && transactions && transactions.length > 0 ) && <Tooltip position='top' text='Clear Search'><FaBrush color="darkred" size={17} onClick={clearTable} cursor='pointer'/></Tooltip>}
                    {(showDetails.table && showAdvance) ?  <Tooltip position='top' text='Close Filter'><FaTimes color='red' size={17} onClick={handleShowAdvance} cursor='pointer'/></Tooltip> : showDetails.table && (<Tooltip position='top' text='Filter by date'><FaFilter color='gray' size={17} onClick={handleShowAdvance} cursor='pointer'/></Tooltip>)}
                    {(showDetails.table && hasRole(user, RULES.exportTickets)) && <Tooltip position='top' text='Export Transactions'><FaFileExport color="green" size={17} onClick={confirmExport} cursor='pointer'/></Tooltip>}
                    {(showDetails.table && hasRole(user, RULES.exportDeleted)) && <Tooltip position='top' text='Export Del Transactions'><FaFileExport color="#E53E3E" size={17} onClick={confirmExportDel} cursor='pointer'/></Tooltip>}
                    {(showDetails.printPreview) && <Tooltip position='left' text='Back'><FaArrowLeft color="black" size={17} onClick={handleExit} cursor='pointer'/></Tooltip>}
                    {(showDetails.printPreview) && <Tooltip position='right' text='Print Transaction'><FaPrint color="black" size={17} onClick={handlePrint} cursor='pointer'/></Tooltip>}
                    {(showDetails.table && hasRole(user, RULES.backup)) && <Tooltip position='top' text='Backup Database'><FaDatabase color='blue' size={17} onClick={handleShowBackUp} cursor='pointer'/></Tooltip>}
                    {(showDetails.table && hasRole(user, RULES.manageUsers)) && <Tooltip position='top' text='Manage Users'><FiUser color='teal' size={17} onClick={handleShowCreateUser} cursor='pointer'/></Tooltip>}
                    
                </div>
        </div>

        {showDetails.table && 
        <div className='result'>
            {isLoading && <Spinner  message='Deleting Transaction...'/>}
            {isLoading2 && <Spinner  message='Fetching Transaction...'/>}
            {isLoading3 && <Spinner  message='Filtering Transactions...'/>}
            {isLoading4 && <Spinner  message='Exporting Transactions...'/>}
            {isLoading5 && <Spinner  message='Exporting Deleted Transactions...'/>}
                {(transactions && transactions.length > 0) ? 
                    (
                        <RequireRole allowedRoles={RULES.viewTickets} showAlert={showAlert} setComp={setDetails} comp='table'>
                            <TTable user={user} transactions={transactions} viewTransaction={viewTransaction} handleEdit={handleEdit} handleDelete={handleDelete} canEdit={canEdit} canDelete={canDelete} />
                        </RequireRole>
                    ) : 
                <p style={{color: "gray"}}>Find transactions ... </p>}    
        </div>}
        {showDetails.printPreview && 
            (
                <RequireRole allowedRoles={RULES.viewTickets} showAlert={showAlert} setComp={setDetails} comp='table'>
                    <DisplayT capturedParams={capturedParams}  ticketField={ticketField} gate2Enabled={gate2Enabled}/>
                </RequireRole>

            )}

        {showDetails.editForm && 
        <div className='edit-wrap'>
            <div className='exit'><p>TID: {transaction.tid}</p><FaTimes onClick={()=>setDetails({table: true})} color='red' cursor="pointer"/></div>
             <RequireRole allowedRoles={RULES.editTicket} showAlert={showAlert} setComp={setDetails} comp='table'>
                    <EditTran  transaction={transaction} transactions = {transactions} setTransactions={setTransactions} handleExit={handleExit} showAlert={showAlert} setTransaction={setTransaction}/>
            </RequireRole>
        </div>}
            
        </div>}
         {
            showDetails.showCreateUser && 
                <div className='create-user-page'>
                   <RequireRole allowedRoles={RULES.manageUsers} showAlert={showAlert} setComp={setDetails} comp='table'>
                     <CreateLogin setDetails={setDetails} showAlert={showAlert} showConfirmAlert={showConfirmAlert} user={user}/>
                    </RequireRole>
                </div>
        }
    </>
  )
}

export default Service;
