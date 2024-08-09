import React, { useEffect, useState } from 'react';
import "./hiddenGroupMembers.css";
import { axiosObj } from '../../utils/axios';
import { useAppContext } from '../../context/appContext'
import { toast } from "react-toastify";
import socket from '../../socketConfig';


const HiddenGroupMembers = (
  {
    setIsHiddenMode , 
    setOpenHiddenGroupMembersModal , 
    cuurentChat , 
    setHiddenFor , 
    prevHiddenMode , 
    setPrevHiddenMode , 
    prevMsg , 
    setPrevMsg,
    setMsgHiddenForArr,
    msgHiddenForArr,
    hiddenFor,
    setMessages ,
    messages,
    funState
  }
  ) => {

    const {user:loggedInUser , token} = useAppContext()

    const [groupMembers , setGroupMembers] = useState([])
    const [selectedMembers , setSelectedMembers] = useState([])
    
    const toastOptions = {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      };


    useEffect(() => {

        const getGroupUsers = async (userId) => {
            try {
                const response = await axiosObj.get(`/auth/getUser/${userId}`)
                return response.data
            } catch (error) {
                //console.log(error)
            }
        }


        const fetchGroupMembers = async () => {
            try {
                // promises will contain array of un resloved promises (pending status) , because we dont await the result from the fun call
                const promises = cuurentChat.members.map(member => getGroupUsers(member))
                const users = await Promise.all(promises)
                setGroupMembers(users.filter(user => user !== null && user._id !== loggedInUser._id))
            } catch (error) {
                //console.log(error)
            }
        }

        fetchGroupMembers()

    } , [])


    const hidePrevMsg = async () => {
      try {

        const response = await axiosObj.put(`/message/hidePrevMsg/${prevMsg?._id}` , {
          hiddenArr : selectedMembers
        } , {
          headers : {
            "admin_header" : `admin ${token}`
          }
        })
        
        socket.emit("messageDeleted" , {message_id : prevMsg?._id , conversationId : cuurentChat._id , members : selectedMembers , senderId : loggedInUser._id })
        
        setMessages(messages.map((msg) => {
          if(msg._id === response.data._id){
            return {...msg , hiddenFor : response.data.hiddenFor}
          }else{
            return msg
          }
        }))

        setPrevHiddenMode(false)

        setPrevMsg(null)

      } catch (error) {
        //console.log(error);
      }
    }


    const handleCheckboxChange = (memberId, isChecked) => {
        if (isChecked) {
          setSelectedMembers(prevState => [...prevState, memberId])
        } else {
          setSelectedMembers(prevState => prevState.filter(id => id !== memberId))
        }
      }


      const handleConfirmSelection = async () => {
        if(selectedMembers.length === 0) return toast.error("No hidden members selected" , toastOptions)
        
        if(prevHiddenMode && prevMsg) await hidePrevMsg()
       
        setHiddenFor(selectedMembers)
        setOpenHiddenGroupMembersModal(false)

        toast.info("Hidden mode been applied" , toastOptions)

      }
      



  return (
    <div className="custom-modal-overlay">

      <div className="custom-modal-content">  

        <h2 className='hiddenModeTitle'>{prevHiddenMode ? "Hide previous message" : "Group Members"}</h2>

        <div className='custom-members-list-container'>
          <div className="custom-members-list">

            {groupMembers.map(member => (

              <div key={member._id} className="custom-member-item">

                <span className='hiddenMemberName'>{member.username}</span>

                <input disabled={hiddenFor?.includes(member._id)} onChange={e => handleCheckboxChange(member._id, e.target.checked)} type="checkbox" id={`member-${member.id}`} className="custom-checkbox" />
                <label htmlFor={`member-${member.id}`} className="custom-label">{member.name}</label>
              
              </div>

            ))}

          </div>
        </div>

        <div className='hiddenModeBtns'>
          <button className='enterHiddenModeBtn bg' onClick={handleConfirmSelection}>{prevHiddenMode ? "Hide message" : "Enter Hidden Mode"}</button>
          <button className='enterHiddenModeBtn cancel-Bg' onClick={() => {setOpenHiddenGroupMembersModal(false) ; setIsHiddenMode(false) ; setPrevHiddenMode(false) ; setPrevMsg(null)}}>cancel</button>
        </div>

      </div>

    </div>
  );
}

export default HiddenGroupMembers;
