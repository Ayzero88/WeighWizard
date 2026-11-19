import React from 'react'
import { FaBowlingBall, FaTimes } from 'react-icons/fa';
import ayzeroxa from '../asset/images/ayzeroxa.png';

const Alert = ({message, type, onClose}) => {

    const alertType = type && type === "success" ? "green" : 
                      type && type === "error" ? "red" : 
                      type && type === "warning" ? "orange" :
                      type && type === "info" ? "blue" : "gray";

  return (
    <div className='overlay'>
        <div className='alert-content'>
            <div className='exit-alert'>
                    <FaTimes onClick={onClose} color='gray'/>
            </div>
            <div className='logo-wrap'><img src={ayzeroxa}/></div>
            <h3><FaBowlingBall color={alertType}/> {message}</h3>

        </div>
    </div>
  )
}

export default Alert;
