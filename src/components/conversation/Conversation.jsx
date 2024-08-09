import React, { useEffect, useState } from "react";
// import "./conversation.scss";
import { axiosObj } from "../../utils/axios";
import profilePic from "../../assets/images/profile.png";
import { useAppContext } from "../../context/appContext";

import { IoNotifications } from "react-icons/io5";
import socket from "../../socketConfig";

const Conversation = ({
  conversation,
  currentUser,
  messages,
  cuurentChat,
  setCurrentChat,
  conversations,
  className,
  onlineRef,
  setOnlineText
}) => {
  const [user, setUser] = useState(null);

  const { token, conversationNames , defaultUser } = useAppContext();
  const { addConversationName } = useAppContext();

  const [classNameState, setClassNameState] = useState("");
  const [avatarSrc, setAvatarSrc] = useState(profilePic);


  const checkAvatarExists = async (avatarUrl) => {
    try {
      const response = await axiosObj.head(avatarUrl);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };
  

  const loadAvatar = async (defaultUser, setAvatarSrc) => {
    if (defaultUser?.avatar) {
      const exists = await checkAvatarExists(defaultUser?.avatar);
      if (exists) {
        setAvatarSrc(defaultUser?.avatar);
      } else {
        setAvatarSrc(profilePic);
      }
    }
  };


  useEffect(() => {
    loadAvatar(user, setAvatarSrc);
  }, [cuurentChat]);


  useEffect(() => {
    const friendId = conversation?.members?.find(
      (member) => member !== currentUser._id
    );

    ////console.log(friendId)
    // then get the all friend document obj
    const getUser = async () => {
      try {
        const response = await axiosObj.get(
          `/auth/getUser/${friendId}`,
          {},
          {
            headers: {
              token_header: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
        
        // //console.log({
        //   name: response.data.username,
        //   _id:  cuurentChat._id,
        // })

        addConversationName({
          name: response.data.username,
          _id: conversation._id,
          isOnline : response.data.isOnline === true ? "online" : "offline"
        });

      } catch (error) {
        // ////console.log(error);
      }
    };

    getUser();

  }, [conversation]);

  ////console.log(conversationNames, conversation);

  useEffect(() => {
    if (conversationNames[conversation._id]?.isUnread)
      setClassNameState(<IoNotifications className="notification-icon" />);
    else setClassNameState(null);
  }, [conversationNames]);

  // //console.log(conversation)


  useEffect(() => {
    
    socket.on("onlineUserId", (userId) => {      
      if (userId === user?._id && conversation?._id === cuurentChat?._id ) {
        addConversationName({
          name: user.username,
          _id: conversation._id,
          isOnline : "online"
        });
      }
    })

    
    socket.on("offlineUserId", (userId) => {      
      if (userId === user?._id && conversation._id === cuurentChat._id ) {
        addConversationName({
          name: user.username,
          _id: conversation._id,
          isOnline : "offline"
        });
      }
    })

  }, [cuurentChat , currentUser])


  //console.log(cuurentChat);


  return (
    <div className={`conversation ${className} ${cuurentChat && cuurentChat !== null && "opened-chat" , cuurentChat && cuurentChat === null && "closed-chat"}`}>
      <>
      <div className="msg-image-container">
          <img
            className="conversationImg"
            src={avatarSrc}
            alt=""
          />
      </div>
        <span>{user?.username}</span>
        {conversationNames[conversation._id]?.isUnread ? classNameState : null}
      </>
    </div>
  );
};

export default Conversation;
//529792
