import React, { useContext, useEffect, useRef, useState } from 'react';
import Btn from '../reuse/Btn';
import {FiArrowLeft, FiStar} from 'react-icons/fi';
import DashBoard from './dashboard/DashBoard';
import Login from '../auth/Login';
import Alert from '../reuse/Alert';
import { AuthContext } from '../auth/AuthContext';
import ConfirmAlert from '../reuse/ConfirmAlert';

const Home = ({homeComponent, setHomeComponent, content, setContent, handleSaveSession, showAlert, 
    alert, closeAlert, remainingDays,  showConfirmAlert, closeConfirmAlert ,confirmAlert, 
     ticketField, setTicketField
}) => {

    const year = new Date().getFullYear();
    const home = useRef(null);
    const login = useRef(null);
    const {user} = useContext(AuthContext);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleGetStarted = ()=>{
        if (windowWidth >= 1040) {
            login.current.style.width = "30%";
            login.current.style.display = "flex";
        };

        if(windowWidth <= 1040){
            login.current.style.width = "100%";
            login.current.style.display = "flex";
            home.current.style.display = "none";
        };
    };

    const handleCloseLoginPage = ()=>{
        if(windowWidth >= 1040){
            home.current.style.width = "100%";
            login.current.style.display = "none";
        };
        
        if(windowWidth <= 1040){
            home.current.style.width = "100%";
            home.current.style.display = "flex";
            login.current.style.display = "none";
        };
    };

  return (
    <>
       {(!homeComponent.showDashBoard) && 

       <div className="landing-page">
            <div className='home' ref={home}>

                <img width="80rem" src={require('../asset/images/wizwand.png')} alt="wand"/>

                <h1>Weigh<span>Wiz</span></h1>

                <div className='btn'>
                    <Btn btnName="Get Started" handleClick={handleGetStarted} p="1rem" fs="1rem" pr = "1rem" col="#fff" bgc="darkBlue" gp="0.5rem" wt="10rem" bd = "none" bdr = "5px" icon = {<FiStar/>}/>
                </div>

                <div className="footer">
                        <img width="40rem" src={require('../asset/images/ayzeroxa2.png')} alt="logo"/>
                        <p>&#169; {year} Ayzeroxa Technologies. All rights reserved.</p>
                </div>

            </div>

            <div className='login-page' ref={login}>

                <div className='close-login-page' onClick={handleCloseLoginPage}><FiArrowLeft/></div>
                
                <Login 
                    showAlert={showAlert} homeComponent={homeComponent} content={content}
                    setHomeComponent={setHomeComponent} handleSaveSession={handleSaveSession}
                />
                    
            </div>
       </div>
        }
        { homeComponent.showDashBoard && ["superadmin", "admin", "operator"].includes(user?.role) &&

            <DashBoard 
                setHomeComponent={setHomeComponent} 
                homeComponent={homeComponent}
                content={content}
                setContent={setContent} 
                handleSaveSession={handleSaveSession}
                showAlert={showAlert}
                user={user}
                remainingDays={remainingDays}
                showConfirmAlert={showConfirmAlert}
                ticketField={ticketField}
                setTicketField={setTicketField}
            />
        }
        {alert.visible && <Alert message={alert.message} type={alert.type} onClose={closeAlert}/>}
        {confirmAlert.visible && (
              <ConfirmAlert
                message={confirmAlert.message}
                type={confirmAlert.type}
                confirmText="OK"
                cancelText="Cancel"
                onCancel={closeConfirmAlert}
                onConfirm={() => {
                  confirmAlert.onConfirm?.();
                  closeConfirmAlert();
                }}
              />
            )}
    </>
  )
}

export default Home;