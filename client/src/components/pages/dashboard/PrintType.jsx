import React, { useEffect, useState } from 'react'
import toggleOff from '../../asset/UI/toggle-off.svg';
import toggleOn from '../../asset/UI/toggle-on.svg';
import { FaAdjust, FaCircle, FaEdit} from 'react-icons/fa';
import axios from 'axios';
import { FiSettings, FiUser } from 'react-icons/fi';

const PrintType = () => {

    const [isToggle, setIsToggle] = useState({
        standard: false,
        straight: false,
        decimal: "",
        editTid: false,
    });

    const [owner, setOwner] = useState({
        owner: '',
        address: '',
        tel: '',
        email: '',
        file: '',
        decimal: '',
    });

    const API_BASE = 'http://localhost:8080';
    const handleInputChange = (event) => {
    const { name, value, files } = event.target;

    if (files && files[0]) {
        const file = files[0];
        const maxSize = 80 * 1024; // 80 KB

        const reader = new FileReader();
        reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            // Set initial dimensions same as image
            let width = img.width;
            let height = img.height;

            // If file exceeds max size, resize proportionally
            let quality = 0.9; // start compression quality
            const resizeAndCompress = () => {
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Base64 (JPEG for compression)
            const base64 = canvas.toDataURL("image/jpeg", quality);
            const base64Size = Math.round((base64.length * 3) / 4); // approximate bytes

            if (base64Size > maxSize && quality > 0.1) {
                // reduce quality
                quality -= 0.1;
                resizeAndCompress();
            } else if (base64Size > maxSize) {
                alert("File too large, even after compression. Try a smaller image.");
            } else {
                // Save only Base64 without the prefix
                setOwner(prev => ({
                ...prev,
                file: base64.split(',')[1]
                }));
            }
            };

            // Trigger resize/compression
            resizeAndCompress();
        };

        img.src = e.target.result;
        };

        reader.readAsDataURL(file);

    } else {
        // normal text input
        setOwner(prev => ({
        ...prev,
        [name]: value
        }));

        setIsToggle(prev => ({
        ...prev,
        [name]: value
        }));
    }
    };
    // Toggle standard or straight

    const handleStandardChoice = ()=>{
        setIsToggle({...isToggle, standard:!isToggle.standard, straight: false });
    };

    const handleStraightChoice = ()=>{
        setIsToggle({...isToggle, straight:!isToggle.straight, standard: false });
    };

    const handleEditToggle = () => {
        setIsToggle(prev => ({...prev, editTid: !prev.editTid}));
    }


    // Save owner info to database (JSON ONLY)
    const handleSaveInfo = async () => {
        await axios.post(`${API_BASE}/ownerinfo`, {
            owner: owner.owner,
            address: owner.address,
            tel: owner.tel,
            email: owner.email,
            logo: owner.file   // Base64 string
        });
    };

    console.log(isToggle.editTid);
    
   // Save print type to database
    const handleSave = async (e) => {
        e.preventDefault();

        if (!isToggle.standard && !isToggle.straight) {
            alert('Please select a print type');
            return;
        }

        const payload = {
            standard: isToggle.standard,
            straight: isToggle.straight,
            adjustDecimal: Number(isToggle.decimal), // convert string to number
            edit: isToggle.editTid
        };

        try {
            await axios.post(`${API_BASE}/print-type`, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            await handleSaveInfo();

            alert('Weigh settings saved successfully');

        } catch (error) {
            console.error(error);
            alert('Failed to save configuration');
        }
    };



   useEffect(() => {
         axios.get(`${API_BASE}/ownerinfo`)
             .then(res => {
            const data = res?.data;
             if(data){
                    setOwner({
                        owner: data.owner,
                        address: data.address,
                        tel: data.tel,
                        email: data.email,
                        file: null
                    })
                };
            }).catch(err => console.error(err));
        axios.get(`${API_BASE}/print-type`)
        .then(res => {
        const { ptype, adjustDecimal, edit } = res.data;

        if (ptype) {
            setIsToggle({
                standard: ptype === 'standard',
                straight: ptype === 'straight',
                decimal: adjustDecimal,
                editTid: JSON.parse(edit)
            });
        }
    })
    .catch(err => console.error(err));

    }, []);


  return (

    <div className='print-type-wrap'>

        <div className='owner'>
            <h3><FiUser/> Owner's Information</h3>
            <input type='text' placeholder="Owner's Name" name='owner' value={owner.owner ?? ''}  onChange={handleInputChange}/>
            <input type='text' placeholder="Owner's Address" name='address' value={owner.address ?? ''}  onChange={handleInputChange}/>
            <input type='text' placeholder="Owner's Phone Number" name='tel' value={owner.tel ?? ''}  onChange={handleInputChange}/>
            <input type='text' placeholder="Owner's Email Address" name='email' value={owner.email ?? ''}  onChange={handleInputChange}/>
        </div>

        <div className='logo-input'>
            <input  type="file"  name="file" className=""  onChange={handleInputChange}/>
        </div>

        <div className='owner'>
            <h3><FiSettings/> Scale Setting</h3>
            <div className='capture-type'>
                <p><FaAdjust/> Standard Weight Capture</p>
                <img onClick={handleStandardChoice} src={isToggle.standard ? toggleOn : toggleOff} alt="toggle button" width="35rem"/>
            
                <p> <FaCircle/> Straight Weight Capture</p>
                <img onClick={handleStraightChoice} src={isToggle.straight ? toggleOn : toggleOff } alt="toggle button" width="35rem"/>
                </div>
                <input type='number' placeholder="Adjust Decimal Places" name='decimal' value={isToggle.decimal ?? ''}  onChange={handleInputChange}/>
                <div className='edit-tid'>
                     <p><FaEdit/> Enable TID Edit</p>
                     <img onClick={handleEditToggle} src={isToggle.editTid ? toggleOn : toggleOff } alt="toggle button" width="35rem"/>
                </div>
                
            
        </div>

      

        <div>
            <button onClick={handleSave}> Save </button>
        </div>

    </div>

  )
};

export default PrintType;