import Btn from '../../reuse/Btn'
import { FiDownload} from 'react-icons/fi'

const CreateTabs = () => {

    const downloadPg = ()=>{
        window.open("https://www.postgresql.org/download/", "_blank");
    };

     const downloadPgA = ()=>{
        window.open("https://www.pgadmin.org/download/", "_blank");
    };
  return (
    <div className='create-db'>
        <div className='create-db-title'>
                <h3>Database Installation</h3>
                <hr/>
        </div>

        <div className='create-content'>
            <Btn icon={<FiDownload/>} btnName="Pg" p="1rem" fs="1rem" bdr="5px" bgc="#b08d57" col="#ffff" bd="none" handleClick={downloadPg}/>
            <Btn icon={<FiDownload/>} btnName="PgA" p="1rem" fs="1rem" bdr="5px" bgc="#b08d57" col="#ffff" bd="none" handleClick={downloadPgA}/>
        </div>
    </div>
  )
}

export default CreateTabs;
