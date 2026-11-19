import React, { useCallback, useEffect, useState } from 'react'
import { FaBalanceScale, FaCircleNotch, FaMapPin, FaPenFancy, FaRedo } from 'react-icons/fa'
import Spinner from '../../reuse/Spinner'
import { BaseUrl } from '../../reuse/BaseUrl';
import axios from 'axios';
import DateTimeString from '../../reuse/DateTimeString';
import TruncateString from '../../reuse/TruncateString';

const REFRESH_MS = 5000; // how often the pending list refreshes in the background

const PendingTransactions = ({
    showAlert,
    setTicketField,
    editTid,
    setEditTid,
    ticketField,
    setCapturedParams,
    setIsPending,
    setFirstOperator,
    isToggle,
    setIsToggle
  } ) => {

 const [search, setSearch] = useState("");
 const [unfinishedTransactions, setUnfinishedTransactions] = useState([]);
 const [searchableItems, setSearchableItems] = useState([]);
 const [filterItem, setFilterItem] = useState(null); // chosen company / vehicle, null = show all
 const [isLoading, setIsLoading] = useState(false);
 const [isLoading2, setIsLoading2] = useState(false);
 const escapeRegExp = (string) => string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
 const escapedSearchInput = escapeRegExp(search);

  // Suggestions shown under the search box
  const filteredData = search.length >= 3 ? searchableItems.filter(name => {
    if (!name) return null;
    const regex = new RegExp(`^${escapedSearchInput.slice(0, 3)}`, 'i');
    return regex.test(name);
  }) : null;

  // The full list, narrowed by the chosen filter (the full list is never overwritten)
  const visibleTransactions = filterItem
    ? unfinishedTransactions.filter(t => t.company === filterItem || t.vehicleNo === filterItem)
    : unfinishedTransactions;

  const handleChoice = (item) => {
    setFilterItem(item);
    setSearch('');
  };

  // Quiet refresher: only reloads the list and search suggestions (no spinner, no alert)
  const loadPendingList = useCallback(async () => {
    const { data } = await axios.get(`${BaseUrl}/transactions/unfinished`);
    setUnfinishedTransactions(data);

    const clientNames = data.map(client => client.company || '');
    const vehicleNums = data.map(vehicle => vehicle.vehicleNo || '');
    setSearchableItems([...new Set([...clientNames, ...vehicleNums])]);
  }, []);

  // Full load: list + print type, with spinner and alert (first load and refresh button)
  const handleFetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [, printType] = await Promise.all([
        loadPendingList(),
        axios.get(`${BaseUrl}/print-type`)
      ]);

      const { ptype, edit } = printType.data;

      if (ptype) {
        setEditTid(JSON.parse(edit));
        setIsToggle({ standard: ptype === 'standard', straight: ptype === 'straight' });
      }
    } catch (error) {
      console.error("Failed to fetch pending transactions.", error);
      showAlert('Failed to fetch pending transactions', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, loadPendingList]);

  const handleRefetch = () => {
    setSearch('');
    setFilterItem(null);
    handleFetchTransactions();
  };

  const handleEditTransaction = async (tid) => {

          if (ticketField.client || ticketField.address || ticketField.product || ticketField.batchNo ||
            ticketField.carrier || ticketField.dest || ticketField.tel || ticketField.vehicleNo) return;

          try {
            setIsLoading2(true);
            const data = await axios.get(`${BaseUrl}/transactions/filter-by-id/${tid}`);
            const transaction = data?.data;

            if (transaction) {
              setTicketField(prev => ({
                ...prev,
                tid: transaction.tid, client: transaction.company, address: transaction.address,
                product: transaction.product, batchNo: transaction.batchNo, carrier: transaction.carrier,
                operator: transaction.operator, dest: transaction.dest, tel: transaction.tel,
                vehicleNo: transaction.vehicleNo, unit: transaction.unit, remark: transaction.remark,
              }));
              setFirstOperator(transaction.operator)

              setCapturedParams(prev => ({
                ...prev,
                istCap: transaction.firstWeight, secCap: transaction.lastWeight,
                tareCap: transaction.tareWeight, netCap: transaction.netWeight,
                grossCap: transaction.grossWeight, fDate: transaction.fwDate,
                sDate: transaction.swDate, tDate: transaction.twDate,
                gDate: transaction.gwDate, nDate: transaction.nwDate
              }));

              const ops_type_lowercase = transaction?.opsType.toLowerCase();
              setIsToggle(prev => ({ ...prev, [ops_type_lowercase]: true }));
              setIsPending(true);
            }
            setIsLoading2(false);
          } catch (error) {
            console.error("Error fetching transaction");
            showAlert("Error fetching transactions to complete.");
            setIsLoading2(false);
          }
  };


    // ---------- Initial Fetch ----------
    useEffect(() => {
        handleFetchTransactions();
    }, []);

    // ---------- Background refresh (so tickets finished on another PC disappear here) ----------
    useEffect(() => {
      const id = setInterval(async () => {
        if (document.hidden || isLoading2 || !isToggle.standard) return;
        try {
          await loadPendingList();
        } catch (error) {
          console.error("Background refresh failed.", error);
        }
      }, REFRESH_MS);

      return () => clearInterval(id);
    }, [loadPendingList, isLoading2, isToggle.standard]);

  return (
     <div className='transact'>

                  <div className='sub-header'>
                    {isToggle.standard ? <h4> <FaBalanceScale/> Pending Transactions [{visibleTransactions.length > 9999999999 ? `9999999999+` : visibleTransactions.length }]</h4> : <h4>Pending Transactions</h4>}
                    {isToggle.standard && <div className='searchBox'>
                        <input placeholder='Find Transactions' name='search' value={search} onChange={(e)=>setSearch(e.target.value)}/>
                        {filteredData && filteredData.length > 0 ?
                            <div className='display-items'>
                                    {filteredData.length > 0 && filteredData.map((item, index)=>
                                        (<ul key={index}>
                                            <li onClick={()=>handleChoice(item)}> <FaMapPin color='orange'/>{item}</li>
                                        </ul>))}
                            </div>
                            :
                            null}
                        <button onClick={handleRefetch}><FaRedo /></button>
                    </div>}

                  </div>
                {isToggle.standard &&
                <div className='transactions'>

                   <div className="transaction-content">
                      {isLoading && <Spinner message="Fetching Pending Transactions..."/>}
                      {isLoading2 && <Spinner message="Uploading pending Transactions..."/>}
                      { visibleTransactions.length > 0 ?
                        visibleTransactions.map((transaction, index)=>{

                          const formattedDataTime = DateTimeString({dateTimeString: transaction.fwDate})
                          const formattedTid = transaction.tid > 9999999999 ? "9999999999+" : transaction.tid
                          const formattedString = `TID: ${formattedTid} | Company: ${transaction.company || "Ananymous"} | V/No: ${transaction.vehicleNo || "-" } | TD: ${formattedDataTime || "No Ops"}`
                          const truncatedString = TruncateString({str: formattedString, maxLength: 115})

                          return(
                          <div className='trans-content-wrap' key={transaction.tid}>
                            <div className='content'><FaCircleNotch size={9} color='orange'/> <p>{truncatedString}</p> </div>
                            <div><FaPenFancy cursor="pointer" onClick={()=>handleEditTransaction(transaction.tid)}/></div>
                        </div>)}) : <p style={{fontStyle: 'italic'}}>No pending transactions...</p>
                      }
                      </div>
                    </div>}

                    {isToggle.straight &&
                    <div className='transactions'>
                          <p style={{fontStyle: 'italic'}}>Not Applicable for Straight Weighing</p>
                      </div>}
              </div>
  )
}

export default PendingTransactions;
