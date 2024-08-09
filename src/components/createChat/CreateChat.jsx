import React, { useEffect, useRef, useState } from "react";
// import "./createchat.scss";
import CloseIcon from "@mui/icons-material/Close";
import { useAppContext } from "../../context/appContext";
import { axiosObj } from "../../utils/axios";
import socket from "../../socketConfig";
import SearchIcon from "@mui/icons-material/Search";
import image from "../../assets/images/ArtboardSmallBackground.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateChat = ({
  setOpenCreateNewChatModal,
  setCurrentChat,
  conversation,
}) => {

  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  
  const { user, token } = useAppContext();

  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);


  function handleSearchContacts(e) {
    setSearchTerm(e.target.value);
  }


  useEffect(() => {
    if (searchTerm !== "") {
      setSearchedUsers([
        ...users.filter((usr) => usr.username.includes(searchTerm)),
      ]);
    } else {
      setSearchedUsers([]);
    }
  }, [searchTerm]);


  
  const getUsers = async () => {
    try {
      const response = await axiosObj.get(`/auth/get-contact-list`, {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });

      setUsers(response.data)

      // setUsers([
      //   ...users,
      //   ...response.data.filter((singleUser) => {
      //     return singleUser.username !== user.username;
      //   }),
      // ]);
      
    } catch (error) {
      //console.log(error);
    }
  };



  useEffect(() => {
    getUsers();
  }, []);



  const createChatWithUser = async (e, singleUser) => {

    e.preventDefault();

    const isConversationAlreadyExist = conversation?.find((conver) => {
      return (
        conver.members.includes(user._id && singleUser._id) && !conver.isGroup
      );
    });

    if (isConversationAlreadyExist) {
      setOpenCreateNewChatModal((prev) => !prev);
      return setCurrentChat(isConversationAlreadyExist);
    }

    try {
      const response = await axiosObj.post(
        "/conversation",
        {
          senderId: user._id,
          receiverId: singleUser._id,
        },
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      setCurrentChat(response.data);

      setOpenCreateNewChatModal((prev) => !prev);

      socket.emit("startConversation", {
        senderId: user._id,
        receiverId: singleUser._id,
        convId: response.data._id,
      });
    } catch (error) {
      // //console.log(error);
    }
  };


  return (
    <div className="createChat">

      <div className="createChat__container custom-createChat__container ">

        <div className="createChat__container__header start-chat-header">
          
          <h3 className="createChat__container__header--tag send-newMsg">Send a message</h3>

          <CloseIcon
            className="createChatCancelIcon"
            onClick={() => setOpenCreateNewChatModal((prev) => !prev)}
          />

        </div>
        
        <div className="start-chat-main-container">

        <form
          className="navbar__search-form search-user"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            className="search-input search-user-input"
            type="text"
            onChange={handleSearchContacts}
            value={searchTerm}
            placeholder="Search users ..."
          />
          {/* <SearchIcon
            className="search-icon"
            onClick={(e) => {
              e.preventDefault();
            }}
          /> */}

          <button className="searchButton">Search</button>

        </form>

        <div className="createChat__container__users--container start-new-chat-users">
          {users !== null
            ? (searchTerm !== "" ? searchedUsers : users)
            .sort((a , b) => {
              if(a.username > b.username){
                return 1
              }
              if(a.username < b.username){
                return -1
              }
              return 0
            }).map((singleUser) => {
                return (
                  <div
                    onClick={(e) => createChatWithUser(e, singleUser)}
                    key={singleUser._id}
                    className="createChat__container__users--container--user"
                  >
                    {singleUser?.username}
                  </div>
                );
              })
            : false}
        </div>

        </div>

        {/* <img className="artImg" src={image} /> */}

      </div>
      
    </div>
  );
};

export default CreateChat;
