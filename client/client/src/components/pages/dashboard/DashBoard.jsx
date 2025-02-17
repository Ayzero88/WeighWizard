import React, { useState } from 'react';
import { FaDatabase, FaWeight, FaDashcube,FaLink, FaCamera, FaHome, FaTimes, FaArrowUp, FaPrint } from 'react-icons/fa';
import cableImage from '../../asset/UI/connects.svg';
import { FiArrowLeft, FiArrowRight} from 'react-icons/fi';
import DataBaseConfig from './DataBaseConfig';
import ScaleConfig from './ScaleConfig';
import Test from './Test';
import Exit from '../../reuse/Exit';
import Logo from '../../reuse/Logo';
import UpdateScaleConfig from './UpdateScaleConfig';
import Capture from './Capture';
import PrintType from './PrintType';


const DashBoard = ({setHomeComponent}) => {
    const [content, setContent] = useState({
        home: true,
        linkDB: false,
        linkScale: false,
        updateScaleParams: false,
        printType: false,
        test: false,
        capture: false,
    });

    const [showDashBoard, setShowDashBoard] = useState(true);
    const [showExp, setShowExp] = useState(true);
    const handleDashToggle = ()=>{
        setShowDashBoard(prev => !prev);
    };

    const handleContents = (content)=>{

        switch(content) {
            case 1:
                setContent({linkDB: true});
                break;
            case 2:
                setContent({linkScale: true});
                break;
            case 3:
                setContent({updateScaleParams: true});
                break;

            case 4:
                    setContent({printType: true});
                    break;
            case 5:
                setContent({test: true});
                break;

            case 6:
                setContent({capture: true});
                break;
            default:
                setContent({home: true});
                break;
        };
    };

    const handleExit = ()=>{
        setContent({home: true});
        setShowExp(true);
    };
    
  return (
    <div className='dash-wrap'>
       { showDashBoard && 

       <div className='dashboard'>
            <h3><FaDashcube color='#fff'/> Wizard</h3>
            <hr/>
            <div className='dash-menu'>
                    <ul>
                            <li onClick={()=>handleContents(1)}> <FaDatabase color='#fff'/>  Check DataBase Link</li>
                            <li onClick={()=>handleContents(2)}> <FaWeight color='#fff'/> Save Scale Parameters</li>
                            <li onClick={()=>handleContents(3)}> <FaArrowUp color='#fff'/> Update Scale Parameters</li>
                            <li onClick={()=>handleContents(4)}> <FaPrint color='#fff'/> Weigh Operation</li>
                            <li onClick={()=>handleContents(5)}> <FaLink color='#fff'/> Test Scale Connection </li>
                            <li onClick={()=>handleContents(6)}> <FaCamera color='#fff'/> Capture Weight</li>
                        
                    </ul>
                    <Logo fs='1rem' imgWt='30rem'/>
            </div>
            
        </div>}
        <div className='cd' style={{width: showDashBoard ? '80%' : "100%"}}>
            {content.home && 
            <div className='dash-title'>
                 <img src={cableImage} alt='cable'/>
                 <h1>APP CONFIGURATION</h1>
                
            </div>}
            {content.linkDB && 
                <DataBaseConfig/>
            }

            {content.linkScale && 
                <ScaleConfig/>
            }

            
            {content.updateScaleParams && 
                <UpdateScaleConfig/>
            }

             {content.printType && 
                <PrintType/>
            }

            {content.test && 
                <Test/>
            }

             {content.capture && 
                <Capture setShowDashBoard={setShowDashBoard} setShowExp={setShowExp} />
            }

            <div className='nav'>
                 <ul>
                    {showExp && <li onClick={handleDashToggle}>{showDashBoard ? <FiArrowLeft size={20} color='#b08d57'/> : <FiArrowRight size={20} color='#b08d57'/> }</li>}
                        <li onClick={()=>setHomeComponent({showCapture: true})}><FaCamera size={20} color='gray'/></li>
                        <li onClick={()=>setHomeComponent({showCapture: false, showDashBoard: false})}><FaHome size={20} color='gray'/></li>
                 </ul>
            </div>

           {!content.home &&  <div className="exit-btn">
                <Exit icon={<FaTimes color='#b08d57'/>} handleClick={handleExit} />
            </div>}

        </div>
    </div>
  )
}

export default DashBoard;