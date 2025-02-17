import React, { useState } from 'react';
import Btn from '../reuse/Btn';
import {FiStar} from 'react-icons/fi';
import DashBoard from './dashboard/DashBoard';



const Home = () => {
    const [homeComponent, setHomeComponent] = useState({
        showDashBoard: false,
    });

    const year = new Date().getFullYear();
    const handleShowDashBoard = () => {
       setHomeComponent({showDashBoard: true});
    };

  return (
    <>
       {(!homeComponent.showDashBoard) && <div className='home'>
            <img width="80rem" src={require('../asset/images/wizwand.png')} alt="wand"/>
            <h1>Weigh<span>Wiz</span></h1>
            <div className='btn'>
                <Btn btnName="Get Started" handleClick={handleShowDashBoard} pt = "1rem" pb = "1rem" pl = "1rem" pr = "1rem" col="#fff" bgc="darkBlue" gp="0.5rem" wt="10rem" bd = "none" bdr = "5px" fs = "1rem" icon = {<FiStar/>}/>
                {/* <Btn btnName="Capture" handleClick={handleShowCapture} pt = "1rem" pb = "1rem" pl = "1rem" pr = "1rem" col="#fff" bgc="darkBlue" gp="0.5rem" wt="10rem" bd = "none" bdr = "5px" fs = "1rem" icon = {<FiCamera/>}/> */}
            </div>
            <p>&#169; {year} PG. All rights reserved.</p>
            
        </div>}
        { homeComponent.showDashBoard &&
            <DashBoard setHomeComponent={setHomeComponent} />
        }
    </>
  )
}

export default Home;