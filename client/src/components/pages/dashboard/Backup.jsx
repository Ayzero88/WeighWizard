import { useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaDatabase, FaSearch } from "react-icons/fa";
import { FiWifi } from "react-icons/fi";
import BtnSpinner from "../../reuse/BtnSpinner";
import { BaseUrl } from "../../reuse/BaseUrl";


const Backup = ({ setDetails, showAlert, showConfirmAlert, user }) => {

  const [fullBackups, setFullBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringFile, setRestoringFile] = useState(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  
  const confirmFullBackup = () => {
    showConfirmAlert(
      "Create a full database backup now?",
      "info",
      backupFullDatabase
    );
  };

  const confirmFullRestore = (filePath) => {
    showConfirmAlert(
      "Restore this backup?.",
      "info",
      () => restoreFullDatabase(filePath)
    );
  };

  const backupFullDatabase = async () => {
      try {
        setIsLoading(true);
        setStatus("Backing up full database...");
        const res = await axios.post(`${BaseUrl}/backup/full-backup`);
        setFullBackups(prev => [...prev, res.data]);
        setStatus("Full backup completed: " + res.data + " ✅");
        showAlert("Full backup created: " + res.data, "success");
        setIsLoading(false);
      } catch (err) {
        setStatus("Full backup failed ❌");
        showAlert("Failed to create full backup.", "error");
        console.error(err);
        setIsLoading(false);
      }
  };

  const restoreFullDatabase = async (filePath) => {


    try {
      setRestoringFile(filePath);
      setStatus("Restoring full database...");

      const normalizedFile = filePath.replaceAll("\\", "/");

      await axios.post(`${BaseUrl}/backup/full-restore`, null, {
        params: { filePath: normalizedFile },
      });

      setStatus("Full restore completed ✅");
      showAlert("Backup restored successfully.", "success");
    } catch (err) {
      setStatus("Full restore failed ❌");
      showAlert("Failed to restore full database.", "error");
      console.error(err);
    } finally {
      setRestoringFile(null);
    }
  };

  const handleFetch = async () => {
    if (!search) {
      showAlert("Please select a month to search.", "error");
      return;
    };

     try {
        const res = await axios.get(`${BaseUrl}/backup/full-backups-by-month`, {
          params: {
            month: search
          }
        });

        setFullBackups(res.data);

      } catch (err) {
        console.error("Failed to search backups:", err);
        showAlert("Failed to search backups.", "error");
      }
  };

  // Call this on component mount
  // useEffect(() => {
  //     const fetchFullBackups = async () => {
  //         try {
  //             const res = await axios.get(`${BaseUrl}/backup/full-backups`);
  //             setFullBackups(res.data);
  //         } catch (err) {
  //             console.error("Failed to fetch full backups:", err);
  //         }
  //     };
  //   fetchFullBackups();
  // }, []);

  return (
    <div className="backup-wrap">
        <div className="backup-exit"> <FaArrowLeft color="#b08d57" onClick={()=> setDetails({showBackup: false, table: true})}/></div>
      <h2><FaDatabase size={20} color="blue"/> Database Backup & Restore</h2>
        <button disabled={isLoading} onClick={confirmFullBackup}>{isLoading ? <BtnSpinner /> : "Backup"}</button>
      {fullBackups.length > 0 && <h3>Full Database Backups</h3>}
      <div className="backup-search">
        <input type='month' placeholder='Find Backup' name='search' value={search} onChange={(e)=>setSearch(e.target.value)}/>
        <FaSearch size={15} onClick={handleFetch} cursor='pointer'/>
      </div>
    <ul>
 
    {fullBackups.map((file, index) => (
        <li key={index}>
        {file}
        {['superadmin', 'admin'].includes(user?.role) && 
        <button
            style={{ marginLeft: 10 }}
            onClick={() => confirmFullRestore(file)}
            disabled={restoringFile !== null}
          >
            {restoringFile === file ? <BtnSpinner /> : "Restore"}
          </button>}
        </li>
    ))}
    </ul>

      {status && <p> <FiWifi color="#b08d57"/> <strong>Status:</strong> {status}</p>}
    </div>
  );
}

export default Backup;