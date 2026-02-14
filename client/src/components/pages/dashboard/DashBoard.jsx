import React, { useState } from 'react';
import { FaDatabase, FaWeight, FaDashcube,FaLink, FaCamera, FaHome, FaTimes, FaArrowUp, FaPrint, FaCog, FaRedo, FaTable } from 'react-icons/fa';
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
import Service from './Service';
import CreateTabs from './CreateTabs';



const DashBoard = ({homeComponent, setHomeComponent, content, setContent,  handleSaveSession}) => {
    const [showDashBoard, setShowDashBoard] = useState(true);
    const [showExp, setShowExp] = useState(true);
    const handleDashToggle = ()=>{
        setShowDashBoard(prev => !prev);
    };

    const handleContents = (content)=>{
        let cont;
        switch(content) {
            case 1:
                cont = {linkDB: true};
                setContent(cont);
                break;
            case 2:
                cont = {linkScale: true};
                setContent(cont);
                break;
            case 3:
                cont = {updateScaleParams: true};
                setContent(cont);
                break;

            case 4:
                cont = {printType: true};
                setContent(cont);
                break;
            case 5:
                cont = {test: true};
                setContent(cont);
                break;

            case 6:
                cont = {capture: true};
                setContent(cont);
                break;
            case 7:
                cont = {service: true};
                setContent(cont);
                break;
            case 8:
                cont = {createTabs: true};
                setContent(cont);
                break;
            default:
                cont = {home: true};
                setContent(cont);
                break;
        };

      
            handleSaveSession(homeComponent, cont);
           
       
    };

    const handleExit = ()=>{
        setContent({home: true});
        setShowExp(true);
        handleSaveSession(homeComponent, {home: true});
    };

    const handleReload =()=>{window.location.reload()};
    
  return (
    <div className='dash-wrap'>
       { showDashBoard && 

       <div className='dashboard'>
            <h3><FaDashcube color='#fff'/> Axpanel</h3>
            <hr/>
            <div className='dash-menu'>
                    <ul>
                            <li onClick={()=>handleContents(8)}> <FaTable color='#fff'/> Create Tabs</li>
                            <li onClick={()=>handleContents(1)}> <FaDatabase color='#fff'/>  Check DB Link</li>
                            <li onClick={()=>handleContents(2)}> <FaWeight color='#fff'/> Scale Parameters</li>
                            <li onClick={()=>handleContents(3)}> <FaArrowUp color='#fff'/> Update Parameters</li>
                            <li onClick={()=>handleContents(4)}> <FaPrint color='#fff'/> Weigh Operation</li>
                            <li onClick={()=>handleContents(5)}> <FaLink color='#fff'/> Test Connection </li>
                            <li onClick={()=>handleContents(6)}> <FaCamera color='#fff'/> Capture Weight</li>
                            <li onClick={()=>handleContents(7)}> <FaCog color='#fff'/> Service Center</li>
                    
                    </ul>
                    <Logo fs='1rem' imgWt='30rem' spanCol="#ffff" tcol="#ffff"/>
            </div>
            
        </div>}
        <div className='cd' style={{width: showDashBoard ? '80%' : "100%"}}>
            {content.home && 
            <div className='dash-title'>
                 <img src={cableImage} alt='cable'/>
                 <Logo fs="3rem" imgWt="10rem" spanCol="#ffff"/>
                
            </div>}

            {content.createTabs && 
                <CreateTabs/>
            }
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

            {content.service && <Service/>} 

            <div className='nav'>
                 <ul>
                    {showExp && <li onClick={handleDashToggle}>{showDashBoard ? <FiArrowLeft size={20} color='#b08d57'/> : <FiArrowRight size={20} color='#b08d57'/> }</li>}
                        {!content.capture && <li onClick={()=>{
                            setContent({capture: true})
                            handleSaveSession(homeComponent, {capture: true})
                            }}><FaCamera size={20} color='gray'/></li>}
                        <li onClick={()=>{
                            setHomeComponent({showDashBoard: false})
                            handleSaveSession({showDashBoard: false}, content)
                            }}><FaHome size={20} color='gray'/></li>
                  
                          <li onClick={handleReload}> <FaRedo size={20} color='gray' /></li>

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