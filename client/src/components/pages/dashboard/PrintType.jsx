import React, { useEffect, useState } from 'react'
import toggleOff from '../../asset/UI/toggle-off.svg';
import toggleOn from '../../asset/UI/toggle-on.svg';
import { FaAdjust, FaCircle, FaEdit} from 'react-icons/fa';
import axios from 'axios';
import { FiSettings, FiUser } from 'react-icons/fi';
import BtnSpinner from '../../reuse/BtnSpinner';
import { BaseUrl } from '../../reuse/BaseUrl';

const PrintType = ({showAlert, showConfirmAlert}) => {

    const [isToggle, setIsToggle] = useState({
        standard: false,
        straight: false,
        decimal: "",
        capacity: "",
        resolution:    "",
        editTid: false,
    });

    const [owner, setOwner] = useState({
        owner: '',
        address: '',
        tel: '',
        email: '',
        file: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    // Settings for every enabled scale beyond Scale 1 (they copy the print type from Scale 1)
    const [extraScales, setExtraScales] = useState([]);

    const handleExtraChange = (scaleId) => (e) => {
        const { name, value } = e.target;
        setExtraScales(prev => prev.map(s => s.scaleId === scaleId ? { ...s, [name]: value } : s));
    };

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
                        showAlert("File too large, even after compression. Try a smaller image.", "error");
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
    };

    // Save owner info to database (JSON ONLY)
    const handleSaveInfo = async () => {
        await axios.post(`${BaseUrl}/ownerinfo`, {
            owner: owner.owner,
            address: owner.address,
            tel: owner.tel,
            email: owner.email,
            logo: owner.file   // Base64 string
        });
    };
    
   // Save print type to database
    const handleSave = async (e) => {
        e.preventDefault();

        if (!isToggle.standard && !isToggle.straight) {
            showAlert("Please select a print type", "error");
            return;
        }

        const payload = {
            scaleId: 'GATE_1',
            standard: isToggle.standard,
            straight: isToggle.straight,
            adjustDecimal: Number(isToggle.decimal),
            capacity: Number(isToggle.capacity),
            resolution: Number(isToggle.resolution),
            edit: isToggle.editTid,
        };

        try {
            setIsLoading(true);
            const config = { headers: { "Content-Type": "application/json" } };

            // Scale 1 first: the other scales copy its print type and TID-edit setting from it
            const res1 = await axios.post(`${BaseUrl}/print-type`, payload, config);
            let allUnchanged = res1.data.status === "unchanged";

            for (const s of extraScales) {
                const r = await axios.post(`${BaseUrl}/print-type`, {
                    scaleId: s.scaleId,
                    adjustDecimal: Number(s.decimal),
                    capacity: Number(s.capacity),
                    resolution: Number(s.resolution),
                }, config);
                allUnchanged = allUnchanged && r.data.status === "unchanged";
            }

            if (allUnchanged) {
                showAlert("No changes made.", "info");
            } else {
                showAlert("Weigh settings saved successfully.", "success");
            }

            await handleSaveInfo();
        } catch (error) {
            console.error(error);
            showAlert("Failed to save configuration.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    const confirmSave = (e) => {
        e.preventDefault();
        showConfirmAlert(
            "Save Configuration?",
            "info",
            ()=>handleSave(e)
        );
    };

   useEffect(() => {
         axios.get(`${BaseUrl}/ownerinfo`)
             .then(res => {
            const data = res?.data;
             if(data){
                    setOwner({
                        owner: data.owner,
                        address: data.address,
                        tel: data.tel,
                        email: data.email,
                        file: data.logo
                    })
                };
            }).catch(err => console.error(err));
        axios.get(`${BaseUrl}/print-type`)
        .then(res => {
        const { ptype, adjustDecimal, capacity, resolution, edit } = res.data;

        if (ptype) {
            setIsToggle({
                standard: ptype === 'standard',
                straight: ptype === 'straight',
                decimal: adjustDecimal,
                capacity: capacity,
                resolution: resolution,
                editTid: JSON.parse(edit)
            });
        }
    })
    .catch(err => console.error(err));

    axios.get(`${BaseUrl}/scale`)
    .then(async res => {
        const extras = (res.data ?? [])
            .filter(c => c.enabled && c.scaleId !== 'GATE_1')
            .sort((a, b) => a.scaleId.localeCompare(b.scaleId));
        const loaded = [];
        for (const c of extras) {
            const p = await axios.get(`${BaseUrl}/print-type`, { params: { scaleId: c.scaleId } });
            const { adjustDecimal, capacity, resolution } = p.data;
            loaded.push({ scaleId: c.scaleId, decimal: adjustDecimal, capacity, resolution });
        }
        setExtraScales(loaded);
    })
    .catch(err => console.error(err));

    }, []);


  return (

    <div className='print-type-wrap'>
      <div className='print-type-content'>
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
           
            <div className='capture-type'>
                <p><FaAdjust/> Standard Weight</p>
                <img onClick={handleStandardChoice} src={isToggle.standard ? toggleOn : toggleOff} alt="toggle button" width="35rem"/>
            
                <p> <FaCircle/> Straight Weight </p>
                <img onClick={handleStraightChoice} src={isToggle.straight ? toggleOn : toggleOff } alt="toggle button" width="35rem"/>
                </div>
                <div className='edit-tid'>
                     <p><FaEdit/> Enable TID Edit</p>
                     <img onClick={handleEditToggle} src={isToggle.editTid ? toggleOn : toggleOff } alt="toggle button" width="35rem"/>
                </div>
                 <h3><FiSettings/> Scale {extraScales.length > 0 ? 1 : ''} Setting</h3>
                <input type='number' placeholder="Decimal Places" name='decimal' value={isToggle.decimal ?? ''}  onChange={handleInputChange}/>
                <input type='number' placeholder="Capacity" name='capacity' value={isToggle.capacity ?? ''}  onChange={handleInputChange}/>
                <input type='number' placeholder="Resolution" name='resolution' value={isToggle.resolution ?? ''}  onChange={handleInputChange}/>
                
        </div>

        {extraScales.map(s => (
                <div className='owner' key={s.scaleId}>
                    <h3><FiSettings/> Scale {s.scaleId.replace('GATE_', '')} Setting</h3>
                    <input type='number' placeholder="Decimal Places" name='decimal' value={s.decimal ?? ''} onChange={handleExtraChange(s.scaleId)}/>
                    <input type='number' placeholder="Capacity" name='capacity' value={s.capacity ?? ''} onChange={handleExtraChange(s.scaleId)}/>
                    <input type='number' placeholder="Resolution" name='resolution' value={s.resolution ?? ''} onChange={handleExtraChange(s.scaleId)}/>
                </div>
            ))}
        
        <div>
            <button disabled={isLoading} onClick={confirmSave}> {isLoading ? <BtnSpinner/> : 'Save'} </button>
        </div>
    </div>
    </div>

  )
};

export default PrintType;
