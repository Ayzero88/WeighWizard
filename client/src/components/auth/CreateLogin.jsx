import React, { useState } from 'react'
import Btn from '../reuse/Btn'
import { FaArrowLeft, FaArrowUp, FaStar, FaTimes } from 'react-icons/fa'
import axios from 'axios';
import BtnSpinner from '../reuse/BtnSpinner';
import { FiArrowDown, FiArrowUp, FiTrash, FiUsers } from 'react-icons/fi';
import Tooltip from '../reuse/Tooltip';
import Spinner from '../reuse/Spinner';
import { BaseUrl } from '../reuse/BaseUrl';
import { RULES, hasRole } from './roles';

const CreateLogin = ({setDetails, showAlert, showConfirmAlert, user}) => {
    const [usr, setUser] = useState({
        username: "",
        password: "",
        role: "",
        allowedScales: "",
    });
    const [holdUsers, setHoldUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading1, setIsLoading1] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);
    const API_BASE = BaseUrl;

    // A superadmin and an admin can both create and manage admins and operators.
    // Nobody manages a superadmin here, and nobody changes or deletes their own account.
    const creatableRoles = ["admin", "operator"];
    const canManageUser = (ur) =>
        !!ur && ur.role !== "superadmin" && ur.id !== user?.id;
    const visibleUsers = users.filter(ur => canManageUser(ur));

    // Per-user scale lock: the stored list is comma-separated; empty means every scale.
    const allScales = ["GATE_1", "GATE_2", "GATE_3", "GATE_4"];
    const scaleList = (value) => (value ? value.split(',').map(s => s.trim()).filter(Boolean) : []);
    const isScaleChecked = (id) => {
        const list = scaleList(usr.allowedScales);
        return list.length === 0 || list.includes(id);
    };
    const toggleScale = (id) => {
        const list = scaleList(usr.allowedScales);
        const current = list.length === 0 ? [...allScales] : [...list];
        const next = current.includes(id) ? current.filter(s => s !== id) : [...current, id].sort();
        if (next.length === 0) {
            showAlert("Pick at least one scale.", 'error');
            return;
        }
        setUser(prev => ({ ...prev, allowedScales: next.length === allScales.length ? "" : next.join(',') }));
    };

    const handleInputChange = (e)=>{
        const {name, value} = e.target;
        setUser(prev=>({
            ...prev,
            [name]: value
        }));
    };
    const handleCreateUser = async() =>{
        if(!usr.username || !usr.password || !usr.role){
            showAlert("All fields are required", 'error');
            return
        };

        if(!creatableRoles.includes(usr.role)){
            showAlert("You are not allowed to create that kind of user.", 'error');
            return
        };

        const userProfile = {
            username: usr.username,
            password: usr.password,
            role: usr.role,
            allowedScales: usr.allowedScales ?? ""
        }

        try {
            setIsLoading(true);
            const created = await axios.post(`${API_BASE}/users`, userProfile, {
                headers: { 'Content-Type': 'application/json' }
            });

            // keep the saved list in step, so the new user shows without reloading
            if(created?.data) setHoldUsers(prev => [...prev, created.data]);

            showAlert(`A login for ${usr.username} was created successfully.`, "success")
            setUser({
                username: '',
                password: '',
                role: '',
                allowedScales: ''
            })
             setIsLoading(false);
        } catch (error) {
            console.error("Error creating a user", error);
            showAlert("Error creating a user login (Investigate for conflict)", "error");
             setIsLoading(false);
        }
    };

    const handleFetchUsers = async()=>{
        if(users.length > 0) return;
        try {
            setIsLoading1(true);
            const res = await axios.get(`${BaseUrl}/users`);
            const allUsers = res?.data;
            if(allUsers.length > 0){
                setIsLoading1(false);
                setUsers(allUsers);
                setHoldUsers(allUsers);
                
            }else{
                showAlert('No user was found', 'error');
                  setIsLoading1(false);
            }
        } catch (error) {
            console.error("Error fetching all users.", error);
            showAlert('Error fetching all users', 'error');
              setIsLoading1(false);
        }
    };

    const handleEdit = (id)=>{
        const userProf = users.length > 0 && users.find(ur => ur.id === id);
        if(!canManageUser(userProf)){
            showAlert("You are not allowed to change this user.", "error");
            return;
        }
        setIsEdit(true);
        setUsers([]);
        setUser(userProf);

        
    };
    const handleUpdateUI = (id, profile) =>{
         const update = holdUsers.map(ur => ur.id === id ? profile : ur);
         setHoldUsers(update);
    };
    const handleDeleteUI = (id)=>{
        const filteredArray = holdUsers.filter(ur => ur.id !== id);
        setHoldUsers(filteredArray);
        setUsers(filteredArray);
    }
    const handleUpdateUser = async()=>{
         if(!usr.username || !usr.role){
            showAlert("All fields are required", 'error');
            return
        };

        if(!canManageUser(usr)){
            showAlert("You are not allowed to change this user.", "error");
            return;
        }

        const userProfile = {
            username: usr.username,
            password: usr.password,
            role: usr.role,
            allowedScales: usr.allowedScales ?? ""
        }

        try {
            setIsLoading2(true);
            await axios.put(`${API_BASE}/users/${usr.id}`, userProfile, {
                headers: { 'Content-Type': 'application/json' }
            });

            handleUpdateUI(usr.id, { ...usr });
            
            showAlert(`${usr.username} profile was updated successfully.`, "success");
             setIsLoading2(false);
        } catch (error) {
            console.error("Error updating a user's profile", error);
            showAlert("Error updating a user's profile", "error");
             setIsLoading2(false);
        }
    };

    const handleDelete = async(id)=>{
        const target = users.find(ur => ur.id === id);
        if(!canManageUser(target)){
            showAlert("You are not allowed to delete this user.", "error");
            return;
        }

        try {
            setIsLoading3(true);
            await axios.delete(`${API_BASE}/users/${id}`)
            handleDeleteUI(id);
            showAlert(`User with id ${id} was successfully deleted.`, "success");
            setIsLoading3(false);
        } catch (error) {
            console.error("Error deleting a user", error);
            showAlert("Error deleting a user", "error");
            setIsLoading3(false);
        }
    };

    // Ask before deleting a login
    const confirmDelete = (ur) => {
        if(showConfirmAlert){
            showConfirmAlert(`Delete the login for ${ur.username}?`, "info", () => handleDelete(ur.id));
        }else{
            handleDelete(ur.id);
        }
    };

    const handleExitUpdate = ()=>{
        setUser({
            username: "",
            password: "",
            role: "",
            allowedScales: ""
        });
        setIsEdit(false);
        setUsers(holdUsers);
        
    };

  return (
    <div className='create-user-content-page'>
        {isLoading1 && <Spinner message="Fetching All Users..."/>}
        {isLoading2 && <Spinner message="Updating user's Profile..."/>}
        {isLoading3 && <Spinner message="Deleting user's Profile..."/>}
         <div className="create-user-exit"> 
            <FaArrowLeft color="#b08d57" onClick={()=> setDetails({showCreateUser: false, table: true})} cursor='pointer'/>
           {!isEdit && <Tooltip position='bottom' text='Fetch Users'>
                {hasRole(user, RULES.manageUsers) && <FiArrowDown color='green' cursor='pointer' size={20} onClick={handleFetchUsers}/>}
            </Tooltip> }

            {isEdit && <Tooltip position='bottom' text='Exit Update'>
                {hasRole(user, RULES.manageUsers) && <FaTimes color='red' cursor='pointer' size={20} onClick={handleExitUpdate}/>}
            </Tooltip> }
        </div>
        {users.length === 0 && <div><h3>{isEdit ? "UPDATE USER" : "CREATE NEW USER"}</h3></div>}
        {users.length === 0 && 
        <div className='create-user-content'>
         <input type='text' placeholder='Username' name='username' value={usr.username ?? ""} onChange={handleInputChange}/>
            {!isEdit && <input type='password' placeholder='Passkey' name='password' value={usr.password ?? ""} onChange={handleInputChange}/>}
            <select value={usr.role ?? ""} name='role' onChange={handleInputChange}>
                <option value="">Role</option>
                {creatableRoles.map(role => (
                    <option key={role} value={role}>{role === "admin" ? "Admin" : "Operator"}</option>
                ))}
            </select>
            <div className='allowed-scales' style={{ marginTop: '1.2rem', textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a6d3b', fontWeight: 600 }}>Allowed scales</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {allScales.map(id => {
                        const checked = isScaleChecked(id);
                        return (
                            <label key={id} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.45rem 0.9rem', borderRadius: '999px', cursor: 'pointer',
                                border: `1.5px solid ${checked ? '#b08d57' : '#d8c9ae'}`,
                                background: checked ? '#b08d57' : '#fdfaf4',
                                color: checked ? '#fff' : '#8a6d3b',
                                fontSize: '0.9rem', fontWeight: 600,
                                transition: 'all 0.15s ease', userSelect: 'none'
                            }}>
                                <input type='checkbox' checked={checked} onChange={() => toggleScale(id)} style={{ display: 'none' }} />
                                <span style={{ fontSize: '0.8rem' }}>{checked ? '✓' : '+'}</span>
                                Scale {id.replace('GATE_', '')}
                            </label>
                        );
                    })}
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#999' }}>All four ticked means every scale.</p>
            </div>
        </div>}

         {users.length > 0 && 
         <div className='view-users-profile'>
            {visibleUsers.length > 0 ? <h4><FiUsers/> All Users </h4> : <p>No user has been created.</p> }
                {visibleUsers.map((ur)=> (
                        <div className='user-profile' key={ur.id}>
        
                            <p><span>Name:</span> {ur.username}</p>
                            <p><span>Role:</span> {ur.role}</p>
                            <p><span>Scales:</span> {ur.allowedScales ? scaleList(ur.allowedScales).map(s => 'Scale ' + s.replace('GATE_', '')).join(', ') : 'All'}</p>
                            <p><span>Id:</span> {ur.id}</p>
                            <Tooltip position='right' text='Update User'></Tooltip><p className='user-update-btn'><FiArrowUp cursor='pointer' onClick={()=>handleEdit(ur.id)}/></p>
                            <Tooltip position='right' text='Delete User'></Tooltip><p className='user-delete-btn'><FiTrash cursor='pointer'  onClick={()=>confirmDelete(ur)}/></p>
                            
                        </div>
                    ))}
        </div>}
          {(users.length === 0 && !isEdit )&& <Btn disabled={isLoading} btnName={isLoading ? <BtnSpinner/> : "Create"} p="0.5rem" fs="1rem" pr = "1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="8rem" bd = "none" bdr = "5px" icon = {isLoading ? "" : <FaStar/>} handleClick={handleCreateUser}/>}
          {(users.length === 0 && isEdit) && <Btn disabled={isLoading2} btnName={isLoading2 ? <BtnSpinner/> : "Update"} p="0.5rem" fs="1rem" pr = "1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="8rem" bd = "none" bdr = "5px" icon = {isLoading2 ? "" : <FaArrowUp/>} handleClick={handleUpdateUser}/>}
    </div>
  )
}

export default CreateLogin
