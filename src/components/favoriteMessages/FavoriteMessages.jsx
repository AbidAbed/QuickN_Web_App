import React, { useEffect, useState } from 'react';
import './favorite-messages.css';
import { axiosObj } from '../../utils/axios';
import {useAppContext} from "../../context/appContext"
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';


function FavoriteMessages({
    setOpenFavortieMessagesModal , 
    cuurentChat , 
    msgStateObj , 
    setMsgStateObj ,
    messages ,
    }) 
    
    {
    
    const {user , token , setSelectedSearchedMessage} = useAppContext()
    
    const [userFavoriteMessages , setUserFavoriteMessages] = useState([])

    
    useEffect(() => {

        const getUserFavoriteMessages = async () => {
            try {

                const response = await axiosObj.get(`/message/get-favorite-messages/${user._id}/${cuurentChat._id}` , {
                    headers : {
                        "token_header" : `Bearer ${token}`
                    }
                })

                setUserFavoriteMessages(response.data);

            } catch (error) {
                console.log(error);
            }
        }

        getUserFavoriteMessages()

    } , [])



    const removeFavoriteMsg = async (msg) => {

        try {
            const response = await axiosObj.patch(`/message/remove-favorite-msg/${msg._id}` , {} , {
                headers : {
                    "token_header" : `Bearer ${token}`
                }
            })

            const unFavoriteMsg = messages.find(message => message._id === msg._id)
            
            // console.log(unFavoriteMsg);
            // console.log(msgStateObj);

            // setMsgStateObj(unFavoriteMsg)
            
            setUserFavoriteMessages(userFavoriteMessages.filter(favMsg => favMsg._id !== msg._id))  

        } catch (error) {
            console.log(error);
        }
    }



    const openFavoriteMsg = (favMsg) => {
      setSelectedSearchedMessage({conversationId : cuurentChat._id , messageId : favMsg?._id , isMessage : true , isGroup : cuurentChat.isGroup , members : cuurentChat.members})
      setOpenFavortieMessagesModal(false)
    }


    return (
     <div>

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-content">

              <div>
                <h2 className="modal-title">Favorite Messages</h2>
                <span onClick={() => setOpenFavortieMessagesModal(false)} className="close-btn">Close</span>
              </div>  
              
              <div className="scrollable-content">
               
                <ul className="modal-list">
                  {userFavoriteMessages && userFavoriteMessages.length > 0 ? userFavoriteMessages.map((favMsg) => {
                    
                    const createdAt = new Date(favMsg?.createdAt);
                    const formattedDate = `${createdAt.getDate()} ${createdAt.toLocaleString('default', { month: 'short' })} ${createdAt.getFullYear()} , ${createdAt.getHours()}:${createdAt.getMinutes()} ${createdAt.getHours() >= 12 ? "pm" : "am"}`;                    
                    
                    return(

                    <li onClick={() => openFavoriteMsg(favMsg)} className="modal-item" key={favMsg?._id}>

                        <span>
                            <p>{favMsg?.file === null ? favMsg?.text : `${favMsg?.filename} file`}</p>
                            <small>send at : {formattedDate} </small>
                        </span>

                        <RemoveCircleIcon onClick={() => removeFavoriteMsg(favMsg)}/>
                    
                    </li>
                    ) 

                  }) : "No favorite messages"}

                </ul>

              </div>

            </div>

          </div>

        </div>

    </div>
  );
}

export default FavoriteMessages;
