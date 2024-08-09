import React from 'react'
import "./approvalModal.css"
import { Link, useParams , useNavigate } from 'react-router-dom'
import { axiosObj } from '../../utils/axios'
import {useAppContext} from "../../context/appContext"
import profilePic from "../../assets/images/profile.png"
import socket from '../../socketConfig'


const Approve = ({setOpenApprovalModal , message , cuurentChat , setMsgHiddenForArr , setPrevMsg , prevMsg , setHiddenFor , hiddenFor}) => {

    const {token , user} = useAppContext()
    
    console.log(hiddenFor);

    const unhideMsg = async (msg) => {
        
        try {

            const response = await axiosObj.put(`/message/resetHiddenMsg/${msg?._id}` , {} , {
                headers : {
                    "admin_header" : `admin ${token}`
                }
            })

            setPrevMsg(response.data)

            setOpenApprovalModal(false)

            message.hiddenFor.map((hiddenUser) => {
                socket.emit("getHiddenMsg" , ({  
                    senderId : message.sender ,
                    receiverId : hiddenUser ,
                    text : message.text ,
                    file : message.file ,
                    convId : message.conversationId ,
                    senderUsername : user.username,
                    _id : message._id,
                    createdAt : message.createdAt ,
                    senderAvatar : user.avatar
                }))
            })

            setMsgHiddenForArr([])
            setHiddenFor([])
            
        } catch (error) {
            console.error("Error unhiding message:", error);
        }
    }



  return (
    <div className='approveModal'>
      
        <div className='approveModalContainer'>
          
            <div className='approveModalContainerContent'>
               
                <h5 className='approveModalContainerContentHeader'>Are you sure to unhide this message ?</h5>
                
                <div className='approveModalActionsContainer'>

                    <button onClick={() => unhideMsg(message)} className='approveModalActionsContainerDeleteBtn'>Unhide message</button>

                    <Link>
                        <button onClick={() => setOpenApprovalModal(false)} className='approveModalActionsContainerCancelBtn'>Cancel</button>
                    </Link>

                </div>

            </div>

        </div>

    </div>
  )
}


export default Approve