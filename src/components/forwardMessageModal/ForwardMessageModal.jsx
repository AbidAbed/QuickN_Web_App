import React, { useEffect, useState } from 'react';
import "./forwardMessageModal.css";
import CloseIcon from '@mui/icons-material/Close';
import { useAppContext } from '../../context/appContext';
import { axiosObj } from '../../utils/axios';
import { toast } from "react-toastify";
import socket from '../../socketConfig';


const ForwardMessageModal = ({ setShowForwardMsgModal, messageFromMessage, conversation, forwardedMsg , setConversation , setArrivalMessages}) => {

    const toastOptions = {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
    };

    const { user, token } = useAppContext();

    const [selectedConversations, setSelectedConversations] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([])

    const [forwardedConversations, setForwardedConversations] = useState([])


    console.log(messageFromMessage);

    const getUsers = async () => {

        try {

            const response = await axiosObj.get(`/auth/get-contact-list`, {
                headers: {
                    token_header: `Bearer ${token}`,
                },
            });

            setUsers(response.data);

        } catch (error) {    
            //console.log(error);
        }
    };


    useEffect(() => {
        getUsers();
    }, []);



    useEffect(() => {

        if (users && users.length > 0 && conversation) {

            const filteredSingleConversations = conversation.filter(conv => conv.isGroup === false);

            const filteredConversationMembers = filteredSingleConversations.reduce((prev, curr) => {
                const [nontLoggedinUser] = curr.members.filter((existUser) => existUser !== user._id)
                return [...prev, nontLoggedinUser]
            }, [])

            const filteredUsers = users.filter(singleUser => {
                const isFoundUser = filteredConversationMembers.find((existUser) => existUser === singleUser._id)
                if (isFoundUser && isFoundUser !== user._id) return false
                else return true
            });

            setFilteredUsers(filteredUsers);

        }

    }, [users])



    const handleConversationChange = (event) => {

        const { checked, value } = event.target;

        if (checked) {
            setSelectedConversations([...selectedConversations, value]);
        } else {
            setSelectedConversations(selectedConversations.filter(conversation => conversation !== value));
        }

    };


    const handleUserChange = (event) => {

        const { checked, value } = event.target;

        if (checked) {
            setSelectedUsers([...selectedUsers, value]);
        } else {
            setSelectedUsers(selectedUsers.filter(user => user !== value));
        }

    };


    const handleForwardMsg = async () => {

        if (selectedConversations.length === 0 && selectedUsers.length === 0)
            return toast.error("You must at least choose one conversation or user to forward the message", toastOptions)
        
        
        // if(messageFromMessage.hiddenFor)

        try {
            const response = await axiosObj.post(`/message/forwardMsg/${messageFromMessage?._id}`, {
                forwardedConversationsArr: selectedConversations,
                usersForwardedArr: selectedUsers
            }, {
                headers: {
                    "token_header": `Bearer ${token}`
                }
            })

            let newConversations = []

            if(selectedUsers.length > 0){
                
                const newConversationsUsers = response.data.reduce((prev , curr) => {
                    const existUser = curr.conversation.members.find((convMember) => convMember !== user._id)
                    
                    if(existUser){
                    
                        const existSelectedUser = selectedUsers.find(selectedUser => selectedUser === existUser)
                    
                        if(existSelectedUser){
                            newConversations.push({...curr}) 
                            return [...prev , {convId : curr._id , recUserId : existSelectedUser}]
                        }else{
                            return prev
                        }

                    }else{
                        return prev
                    } 

                }, [])

                newConversationsUsers.map((newUserConv) => {
                    socket.emit("startConversation" , {
                        senderId : user._id ,
                        receiverId : newUserConv.recUserId ,
                        convId : newUserConv.convId
                    })        
                })

                setConversation([...newConversations , ...conversation])
                
            }

            response.data.map((forwardConv) => {
                forwardConv.conversation.members.map((forwardMsgMember) => {
                    if(forwardMsgMember !== user._id){
                        socket.emit("forwardMsg", {
                            receiverId: forwardMsgMember,
                            senderId: user._id,
                            message: { ...forwardConv.newMsg },
                            createdAt: forwardConv.newMsg.createdAt,
                            _id: forwardConv.newMsg._id,
                            convId: forwardConv.conversation._id,
                            senderUsername: user.username,
                            senderAvatar: user.avatar ,
                        })
                    }else{
                        setArrivalMessages({...forwardConv.newMsg , convId : forwardConv.newMsg.conversationId , isForwarded : forwardConv.newMsg.isForwarded })
                    }
                })
            })

            setShowForwardMsgModal(false)

            toast.success(`message been forwarded successfully`, toastOptions)

        } catch (error) {
            //console.log(error);
        }
    }



    return (

        <div className="ForwardMessageModal">

            <div className="ForwardMessageModal-modal-content">

                <button className="ForwardMessageModal-close" onClick={() => setShowForwardMsgModal(false)}>
                    <CloseIcon />
                </button>

                <div className="modal-row">

                    <div className="modal-column">

                        <h2 className='forwardMsgHeader'>Previous Conversations</h2>

                        <div className='conversationsContainer'>

                            {conversation && conversation.map((singleConversation) => {
                                return (
                                    <div key={singleConversation._id} className='singleConversation'>
                                        <input value={singleConversation._id.toString()} onChange={handleConversationChange} type="checkbox" id="conversation" name="conversation" className="previous-conversation" />
                                        <label htmlFor="conversation1">{singleConversation.convName}</label><br/>
                                    </div>
                                )
                            })}

                        </div>

                    </div>

                    <div className="modal-column">

                        <h2 className='forwardMsgHeader'>All Users</h2>

                        <div className='conversationsContainer'>
                            {filteredUsers && filteredUsers.length > 0 && filteredUsers.map((filteredUser) => {
                                return (
                                    <div key={filteredUser._id} className='singleConversation'>
                                        <input onChange={handleUserChange} value={filteredUser._id} type="checkbox" id="conversation1" name="conversation1" className="previous-conversation" />
                                        <label htmlFor="conversation1">{filteredUser.username}</label><br />
                                    </div>
                                )
                            })}

                        </div>

                    </div>

                </div>

                <div className='forward-actions-btns'>
                    <button onClick={handleForwardMsg} className='forward-btn'>Forward</button>
                    <button onClick={() => setShowForwardMsgModal(false)} className='cancel-btn'>cancel</button>
                </div>
            </div>

        </div>

    );
}

export default ForwardMessageModal;
