import React, { useContext, useState } from 'react'
import { FiLogIn } from 'react-icons/fi';
import Btn from '../reuse/Btn';
import BtnSpinner from '../reuse/BtnSpinner';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { BaseUrl } from '../reuse/BaseUrl';

const Login = ({showAlert, homeComponent, setHomeComponent, handleSaveSession, content}) => {
  
    const [user, setUsr] = useState({
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const {setUser} = useContext(AuthContext);
    const handleShowDashBoard = () => {
        setHomeComponent({showDashBoard: true});
        handleSaveSession({showDashBoard: true}, content);    
    };
    const handleInputChange = (e)=>{
        const {name, value} = e.target;
        setUsr(prev => ({...prev, [name]: value}));
    };

    const handleLogin = async()=>{
        if(!user.username || !user.password){
            showAlert('All fields are required.', 'error');
            return;
        };

        try {
            setIsLoading(true);
       
            const response = await axios.post(`${BaseUrl}/users/login`, user, {
                headers: { 'Content-Type': 'application/json' }
            });
          
            const res = response?.data;
            if(res?.token && res?.user){
                localStorage.setItem("wt", res.token);
                setUser(res.user);
                localStorage.setItem("up", JSON.stringify(res.user));
                handleShowDashBoard();
                setIsLoading(false);
            }else{
                showAlert('Invalid username and password.', 'error');
                setIsLoading(false);
            };
            
            
        } catch (error) {
          console.error("Login error:", error.response || error);
          showAlert('Error Creating Access.', 'error');
          setIsLoading(false);  
        }
    };

 
  return (
    <div className='login-page-content'>
        <input type='text' placeholder='Operator' name='username' value={user.username} onChange={handleInputChange}/>
        <input type='password' placeholder='Passkey' name='password' value={user.password} onChange={handleInputChange}/>
        <Btn btnName={isLoading ? <BtnSpinner/> : "Login"} disabled={isLoading} p="0.5rem" fs="1rem" pr = "1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="8rem" bd = "none" bdr = "5px" icon = {isLoading ? '' : <FiLogIn/>} handleClick={handleLogin}/>
    </div>
  )
}

export default Login;
