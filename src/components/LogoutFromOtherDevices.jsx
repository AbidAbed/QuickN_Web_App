import React from 'react';
import { useAppContext } from '../context/appContext';
import socket from "../socketConfig"
import {useNavigate} from "react-router-dom"


const LogOutFromOtherDevices = () => {

    const {hideLogoutModal , user , logoutUser , token } = useAppContext()

    const navigate = useNavigate()

    const handleLogoutFromOtherDevices = async () => {

        try {
            await socket.emit("logoutUser" , {receiverId : user._id})
    
            await socket.emit("addUser", {
                userId: user._id,
                token: user.isAdmin ? `admin ${token}` : `Bearer ${token}`,
                timestamp: Date.now(),
              });

            hideLogoutModal()
            
            navigate("/")        
            
        } catch (error) {
            
        }
    }



    const handleLogoutFromCurrentDevice = async () => {
        logoutUser()
    }



    return (

    <div style={overlayStyle}>
    
      <div style={modalStyle}>
    
        <h2>Logout from Other Devices</h2>
    
        <p style={pStyle} className='p-logout'>You are logged in from other devices. Do you want to logout from them?</p>
    
        <div style={buttonContainer}>
          <button onClick={handleLogoutFromOtherDevices} style={logoutButtonStyle}>Logout from other devices</button>
          <button onClick={handleLogoutFromCurrentDevice} style={logoutButtonStyle}>Logout from this device</button>
          <button  onClick={hideLogoutModal} style={cancelButtonStyle}>Cancel</button>
        </div>

      </div>

    </div>
  );
};


const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalStyle = {
  background: '#fff',
  padding: '3vw',
  borderRadius: '5px',
  width: '48vw',
  textAlign: 'center',
};

const buttonContainer = {
  marginTop: '2vw',
};

const logoutButtonStyle = {
  background: 'red',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '5px',
  marginRight: '10px',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  background: '#ccc',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop : "1vw"
};

const pStyle = {
  marginTop : "1.5vw" ,
  marginBottom : "1vw"
}

export default LogOutFromOtherDevices;
