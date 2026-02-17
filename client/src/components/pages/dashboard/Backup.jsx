import { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaDatabase } from "react-icons/fa";
import { FiWifi } from "react-icons/fi";

const API = "http://localhost:8080/backup";

const Backup = ({ setShowBackUp }) => {
  const [fullBackups, setFullBackups] = useState([]);

  const [status, setStatus] = useState("");

  const backupFullDatabase = async () => {
  try {
    setStatus("Backing up full database...");
    const res = await axios.post(`${API}/full-backup`);
    setFullBackups(prev => [...prev, res.data]);
    setStatus("Full backup completed: " + res.data + " ✅");
  } catch (err) {
    setStatus("Full backup failed ❌");
    console.error(err);
  }
};

const restoreFullDatabase = async (filePath) => {
  try {
    setStatus("Restoring full database...");
    const normalizedFile = filePath.replaceAll("\\", "/"); // fix Windows path
    await axios.post(`${API}/full-restore`, null, { params: { filePath: normalizedFile } });
    setStatus("Full restore completed ✅");
  } catch (err) {
    setStatus("Full restore failed ❌");
    console.error(err);
  }
};


// Call this on component mount
useEffect(() => {
    const fetchFullBackups = async () => {
        try {
            const res = await axios.get(`${API}/full-backups`);
            setFullBackups(res.data);
            console.log(res.data)
        } catch (err) {
            console.error("Failed to fetch full backups:", err);
        }
    };
  fetchFullBackups();
}, []);


  return (
    <div className="backup-wrap">
        <div className="backup-exit"> <FaArrowLeft color="#b08d57" onClick={()=> setShowBackUp(false)}/></div>
      <h2><FaDatabase size={20} color="blue"/> Database Backup & Restore</h2>
        <button onClick={backupFullDatabase}>Full Database Backup</button>
      {fullBackups.length > 0 && <h3>Full Database Backups</h3>}
    <ul>
    {fullBackups.map((file, index) => (
        <li key={index}>
        {file}
        <button
            style={{ marginLeft: 10 }}
            onClick={() => restoreFullDatabase(file)}
        >
            Restore
        </button>
        </li>
    ))}
    </ul>

      {status && <p> <FiWifi color="#b08d57"/> <strong>Status:</strong> {status}</p>}
    </div>
  );
}

export default Backup;