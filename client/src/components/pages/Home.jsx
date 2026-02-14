import React from 'react';
import Btn from '../reuse/Btn';
import {FiStar} from 'react-icons/fi';
import DashBoard from './dashboard/DashBoard';

const Home = ({homeComponent, setHomeComponent, content, setContent, handleSaveSession}) => {

    const year = new Date().getFullYear();
    const handleShowDashBoard = () => {
       setHomeComponent({showDashBoard: true});
        handleSaveSession({showDashBoard: true}, content);
    };


  return (
    <>
       {(!homeComponent.showDashBoard) && <div className='home'>
            <img width="80rem" src={require('../asset/images/wizwand.png')} alt="wand"/>
            <h1>Weigh<span>Wiz</span></h1>
            <div className='btn'>
                <Btn btnName="Get Started" handleClick={handleShowDashBoard} p="1rem" fs="1rem" pr = "1rem" col="#fff" bgc="darkBlue" gp="0.5rem" wt="10rem" bd = "none" bdr = "5px" icon = {<FiStar/>}/>
            </div>
            <div className="footer">
                    <img width="40rem" src={require('../asset/images/mylogo.png')} alt="logo"/>
                    <p>&#169; {year} Ayzerox. All rights reserved.</p>
            </div>
            
            
        </div>}
        { homeComponent.showDashBoard &&
            <DashBoard 
                setHomeComponent={setHomeComponent} 
                homeComponent={homeComponent}
                content={content}
                setContent={setContent} 
                handleSaveSession={handleSaveSession}
            />
        }
    </>
  )
}

export default Home;