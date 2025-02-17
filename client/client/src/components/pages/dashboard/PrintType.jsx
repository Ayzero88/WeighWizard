import React, { useEffect, useState } from 'react'
import toggleOff from '../../asset/UI/toggle-off.svg';
import toggleOn from '../../asset/UI/toggle-on.svg';
import { FaAdjust, FaCircle, FaPlane } from 'react-icons/fa';

const PrintType = () => {

    const [isToggle, setIsToggle] = useState({
        standard: false,
        straight: false,
    });

    const handleStandardChoice = ()=>{
        setIsToggle({...isToggle, standard:!isToggle.standard, straight: false });
    };

    const handleStraightChoice = ()=>{
        setIsToggle({...isToggle, straight:!isToggle.straight, standard: false });
    };

    const handleSave = async(e)=>{
        e.preventDefault();
        try {
                if(isToggle.standard || isToggle.straight){
                const response = await fetch('/print-type', {

                    method: 'POST',
                    headers: { 'Content-type': 'application/json'},
                    body: JSON.stringify(isToggle),

                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                alert(`Print type saved successfully`);

                
            };
        } catch (error) {
            console.error("Failed to send print params", error);
            alert(`Failed to save print params. Check database connection.`);
        }
       
    };

    useEffect(()=>{
        let printType = {standard: false, straight: false}
        fetch('http://localhost:5000/print-type-param')
        .then(response => response.json())
        .then(data =>{
            printType[data.printType.ptype] = true;
            setIsToggle(printType);
        })
        .catch(error => console.error("Failed to fetch print type params. Check database connection.", error));
    }, []);

  return (

    <div className='print-type-wrap'>
        <div>
            <p><FaAdjust/> Standard Weight Capture</p>
            <img onClick={handleStandardChoice} src={isToggle.standard ? toggleOn : toggleOff} alt="toggle button" width="35rem"/>
        </div>
        
        <div>
            <p> <FaCircle/> Straight Weight Capture</p>
            <img onClick={handleStraightChoice} src={isToggle.straight ? toggleOn : toggleOff } alt="toggle button" width="35rem"/>
        </div>

        <div>
            <button onClick={handleSave}> Save </button>
        </div>

    </div>

  )
};

export default PrintType;