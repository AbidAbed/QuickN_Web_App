import React, { useEffect, useState, useRef } from "react";
// import "./message.css";
import { format } from "timeago.js";
import profilePic from "../../assets/images/profile.png";
import { useAppContext } from "../../context/appContext";
import { axiosObj } from "../../utils/axios";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import socket from "../../socketConfig";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-toastify";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HiddenGroupMembers from "../hiddenGroupMembers/HiddenGroupMembers";
import ApprovalModal from "../../components/aprrovalModal/ApprovalModal"
import RedoIcon from '@mui/icons-material/Redo';
import ForwardMessageModal from "../forwardMessageModal/ForwardMessageModal";
import groupPic from "../../assets/images/groupPic.jpg";
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import StarsIcon from '@mui/icons-material/Stars';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ImageIcon from '@mui/icons-material/Image';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import FavoriteMessages from "../favoriteMessages/FavoriteMessages";



const Message = ({
  message,
  own,
  setSeen,
  cuurentChat,
  group,
  conversation,
  currentUser,
  messages,
  senderUsername,
  isFromSearchId,
  scrollContainerRef,
  topMessageId,
  isMessageIdFromSearch,
  setIsMessageIdFromSearch,
  isHiddenMode,
  setIsHiddenMode,
  setHiddenFor ,
  setOpenHiddenGroupMembersModal,
  openHiddenGroupMembersModal,
  setPrevHiddenMode,
  setPrevMsg,
  setFunState,
  singleChatConverImg,
  setShowForwardMsgModal,
  showForwardMsgModal,
  setConversation,
  conversationNames,
  usersInGroupChat,
  groupConvImg,
  setOpenGroupInfoModal,
  openFavortieMessagesModal ,
  setOpenFavortieMessagesModal ,
  setArrivalMessages,
  prevMsg ,
  hiddenFor
}) => {


  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };


  const contextRef = useRef();

  const { user , token } = useAppContext();

  const [fileMsg, setFileMsg] = useState(null);

  const [senderId, setSenderId] = useState(null);

  let [usersInGroup, setUsersInGroup] = useState([]);

  const [groupUserIds , setGroupUserIds] = useState([])

  const [groupUsers , setGroupUsers] = useState([])

  const [userMessage, setUserMessage] = useState();

  const [filePressed, setFilePressed] = useState(false);

  const [isReFetch, setIsReFetch] = useState(false);

  const [isNextPageAvaileble, setIsNextPageAvailable] = useState(true);

  const [draw, setDraw] = useState(false);

  const [isDoubleCliked , setIsDoubleCliked] = useState(false)

  const [page, setpage] = useState(1);

  const [newText, setNewText] = useState("");

  const [isEditMode, setIsEditMode] = useState();

  const [archivedMsg , setArchivedMsg] = useState(null)
  const [isArchivedMsg , setIsArchivedMsg] = useState(false)


  const handleCancelUpload = async (fileId) => {
    try {
      ////console.log("MESSSSAGE", message._id);
      const response = await axiosObj.delete(
        `/message/file/singleFile/uploading/discard`,
        {
          data: {
            fileId: fileId,
          },
        }
        // {
        //   headers: {
        //     token_header: `Bearer ${token}`,
        //   },
        // }
      );
      setFileMsg(response.data);
      setIsReFetch(false);
    } catch (error) {
      ////console.log(error);
    }
  };



  const handleOnNewTextChange = (e) => {
    setNewText(e.target.value);
  };

  
  const [content, setContent] = useState(
    `<div>
    <canvas key="dataViewer" ref=${contextRef} />
    ${
      page !== 1 && draw
        ? `  <button class="next-prev-button" onClick=${handlePreviousPage}>previous page</button>`
        : ""
    }
    ${
      draw && isNextPageAvaileble
        ? `<button onClick=${handleNextPage}>next page</button>`
        : ""
    }
  </div>`
  );


  const getFile = async () => {
    try {
      ////console.log("MESSSSAGE", message._id);
      const response = await axiosObj.get(`/message/getFile/${message?.file}`, {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });
      if (response.data.isUploading && !response.data.isUploaded) {
        setIsReFetch(true);
      }
      setFileMsg(response.data);
    } catch (error) {
      ////console.log(error);
    }
  };


  useEffect(() => {
    if (isReFetch) {
      setTimeout(() => {
        getFile();
      }, 2000);
      setIsReFetch(false);
    }
  }, [isReFetch]);


  useEffect(() => {
    setSeen(true);
    if (cuurentChat) {
      setSenderId(cuurentChat?.members?.find((member) => member === user?._id));
    }
  }, [cuurentChat]);


  const downloadFile = async () => {
    // const downloadUrl = ` http://localhost:5000/download/${fileMsg?.filename}`;
    // const downloadLink = document.createElement('a');
    // downloadLink.href = downloadUrl;
    // downloadLink.download = fileMsg?.filename;
    // document.body.appendChild(downloadLink);
    // downloadLink.click();

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const popupWidth = 600;
    const popupHeight = 600;

    const left =
      (screenWidth - popupWidth) / 2 + window.screenX ||
      window.screenLeft ||
      window.screen.availLeft ||
      0;

    const top =
      (screenHeight - popupHeight) / 2 + window.screenY ||
      window.screenTop ||
      window.screen.availTop ||
      0;

    const options = `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`;

    let fileExt = fileMsg?.filename.split(".").pop();

    let win = window.open(``, "_blank", options);

    const overlayDiv = win.document.createElement("div");

    overlayDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; 
    `;

    win.document.body.innerHTML = content;

    win.document.oncontextmenu = (e) => {
      e.preventDefault();
      return false;
    };

    win.focus();

    win.moveTo(left, top);
  };


  function handleCancel() {
    setDraw(false);
  }
  // ////console.log(cuurentChat)

  useEffect(() => {
    if (draw) {
      loadImage();
    }
  }, [page]);


  function handlePreviousPage() {
    setpage(page - 1);
  }


  function handleNextPage() {
    setpage(page + 1);
  }


  function loadImage() {
    const img = new Image();
    img.onload = () => {
      const ctx = contextRef.current.getContext("2d");
      contextRef.current.width = img.width;

      contextRef.current.height = img.height;

      ctx.clearRect(0, 0, contextRef.current.width, contextRef.current.height);

      ctx.drawImage(img, 0, 0);

      if (fileMsg.numberOfPages !== 0 && page < fileMsg.numberOfPages)
        setIsNextPageAvailable(true);
      else setIsNextPageAvailable(false);

    };

    img.onloadeddata = () => {
      downloadFile();
    };

    img.onerror = function () {
      setIsNextPageAvailable(false);
    };

    //todo http://localhost:5000/api/v1/message/file/binary?fileId=${fileMsg._id}&page=${page}
    img.src = `http://localhost:5000/api/v1/message/file/binary?fileId=${fileMsg._id}&page=${page}`;
  
  }


  useEffect(() => {
    cuurentChat &&
      cuurentChat?.members &&
      cuurentChat.members.map((member) => {
        !usersInGroup.includes(member) && usersInGroup.unshift(member);
      });

    const getAllUsersInsideGroup = async () => {
      try {
        const response = await axiosObj.post(
          "/auth/getUsers",
          {
            userIds: usersInGroup,
          },
          {
            headers: {
              token_header: `Bearer ${token}`,
            },
          }
        );
        setUsersInGroup(response.data);
      } catch (error) {
        // ////console.log(error);
      }
    };

    getAllUsersInsideGroup();
  }, [cuurentChat]);

  // ////console.log(usersInGroup)


  // iterate over usersIds array and filter the messages array by keep messages sender id that match the userId in the userIds array
  const filterdMessgesByUser = usersInGroup.map((user) => {
    const mesaggesForEachUser = messages?.filter(
      (msg) => msg.sender === user._id
    );
    return {
      userId: user._id,
      userName: user.username,
      messagesForUser: mesaggesForEachUser,
    };
  });


  const handleFilePressed = async () => {
    setFilePressed(true);
    setFileMsg({ isUploading: true, isUploaded: false });
    await getFile();
  };


  const deleteMessage = async (e, message_id, conversationId) => {
    try {
      e.preventDefault();
      // ////console.log(1);
      const response = await axiosObj.delete(
        `/message/${conversationId}/${message_id}`,
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );

      const [conversationMembers] = conversation.filter(
        (conv) => conv._id === conversationId
      );

      // Assuming 'socket' is accessible and connected properly
      socket.emit("messageDeleted", {
        message_id: message_id,
        conversationId: conversationId,
        members: conversationMembers.members,
        senderId: user._id,
      });
    } catch (err) {
      // ////console.log(err);
    }
  };


  const updateMessage = async (e, message_id, conversationId) => {
    try {
      e.preventDefault();
      // ////console.log(1);
      const response = await axiosObj.put(
        `/message/${conversationId}/${message_id}`,
        { newText: newText },
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );

      const [conversationMembers] = conversation.filter(
        (conv) => conv._id === conversationId
      );

      // Assuming 'socket' is accessible and connected properly
      
      // to emit message update for the hidden members of the message

      socket.emit("updatedMessage", {
        message_id: message_id,
        conversationId: conversationId,
        members : conversationMembers.members,
        senderId: user._id,
        newText: newText,
      });

      // socket.emit("updatedMessage", {
      //   message_id: message_id,
      //   conversationId: conversationId,
      //   members: message.hiddenFor.length > 0 ? message.hiddenFor : conversationMembers.members,
      //   senderId: user._id,
      //   newText: newText,
      // });



    } catch (err) {
      // ////console.log(err);
    }
  };
  // ////console.log(filterdMessgesByUser)


  useEffect(() => {
    if (
      isFromSearchId &&
      isFromSearchId === message._id &&
      isMessageIdFromSearch
    ) {
      scrollToMessage(message._id);
      setIsMessageIdFromSearch(false);
    }
  }, [message]);


  const scrollToMessage = (elementId) => {
    const element = document.getElementById(elementId);

    ////console.log(element);

    if (element && scrollContainerRef.current) {
      const elementRect = element.getBoundingClientRect();
      const scrollableDivRect =
        scrollContainerRef.current.getBoundingClientRect();

      // Calculate the element's Y position within the scrollable div
      const yPositionInScrollableDiv = elementRect.top - scrollableDivRect.top;

      // Scroll to the element
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollTop + yPositionInScrollableDiv,
        behavior: "smooth",
      });
    }
  };


  const downloadFileById = async (e, file) => {
    e.preventDefault();

    try {
      const response = await axiosObj.get(`message/admin/file/${file._id}`, {
        responseType: "blob",
        headers: {
          admin_header: `admin ${token}`,
        },
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const downloadLink = document.createElement("a");

      downloadLink.href = window.URL.createObjectURL(blob);

      downloadLink.download = `${file.filename}.${file.extension}`;

      document.body.appendChild(downloadLink);

      downloadLink.click();

      document.body.removeChild(downloadLink);
    } catch (error) {
      // ////console.log(error);
    }
  };

  //console.log();

  /////////////////////////////////////////////////////////////////////////////////

  const [openApprovalModal , setOpenApprovalModal] = useState(false)
  const [msgHiddenForArr , setMsgHiddenForArr] = useState(message?.hiddenFor)


  useEffect(() => {
    setMsgHiddenForArr(message.hiddenFor)
  } , [message.hiddenFor])


  
  const archiveMsg = async (msg) => {

    if(msg?.hiddenFor?.length > 0) return toast.error("You can't archive a hidden msg" , toastOptions)

     try {

       const response = await axiosObj.put(`/message/archiveMsg/${msg?._id}` , {
         usersInGroup : cuurentChat?.members?.filter(member => member !== user._id)
       } , {
         headers : {
            "admin_header" : `admin ${token}` 
         }
       })

       socket.emit("messageDeleted", {senderId : msg.sender , conversationId : msg.conversationId , message_id : msg._id , members : cuurentChat?.members?.filter(member => member !== user._id)} );

       setMsgHiddenForArr(response.data.hiddenFor)

       toast.info("Message been archived" , toastOptions)

     } catch (error) {
       console.log(error);      
     }
  } 
  

  const resetArchivedMsg = async (msg) => {

    try {

      await axiosObj.put(`/message/resetArchivedMsg/${msg?._id}` , {} , {
        headers : {
          "admin_header" : `admin ${token}`
        }
      })

      setMsgHiddenForArr([])

      toast.info("Message been removed from archived" , toastOptions)

    } catch (error) {
      //console.log(error);
    }
  }



 const hidePrevMsg = async (msg) => {
  setPrevMsg(msg)
  setPrevHiddenMode(true)
  setIsHiddenMode(true)
  setOpenHiddenGroupMembersModal(true)
}


const resetHiddenMsg = (msg) => {
  if(msg?.hiddenFor?.length > 0){
    setOpenApprovalModal(true)
  }
} 


const [forwardedMsg , setForwardedMsg] = useState(message && message)


useEffect(() => {
  setForwardedMsg(message)
} , [])



const [msgStateObj , setMsgStateObj] = useState(message)
const [msgForwObj , setMsgForwObj] = useState(null)
// const [favoriteMsgObj , setFavoriteMsgObj ] = useState(message)


useEffect(() => {
  setMsgStateObj(message)
} , [message])

  
console.log(msgStateObj);


//////////////////////////////////////////////////////////////////////////


  const [seeMoreMsg , setSeeMoreMsg] = useState(false)

  const [favoriteMessages , setFavoriteMessages] = useState([])

  // const getUserFavoriteMessages = async () => {
  //   try {
      
  //     const response = await axiosObj.get(`/message/get-favorite-messages/${user._id}` , {
  //       headers : {
  //         "token_header" : `Bearer ${token}`
  //       }
  //     })

  //     setFavoriteMessages(response.data)
    
  //   } catch (error) {
  //     //console.log(error);  
  //   }
  // }


  // useEffect(() => {

  //   getUserFavoriteMessages()

  // } , [cuurentChat])




  const favortiteMsg = async (msg) => {
    try {
      const response = await axiosObj.patch(`/message/favortite-msg/${msg._id}` , {} , {
        headers : {
          "token_header" : `Bearer ${token}`
        }
      })
      setMsgStateObj(response.data)
    } catch (error) {
      //console.log(error)
    }
  }


  const removeFavoriteMsg = async (msg) => {
    try {
      const response = await axiosObj.patch(`/message/remove-favorite-msg/${msg._id}` , {} , {
        headers : {
          "token_header" : `Bearer ${token}`
        }
      })
      setMsgStateObj(response.data)
    } catch (error) {
      //console.log(error)
    }
  }




  return (
    <>

      <div className="first-msg" style={own ? { display: "flex", alignItems : "flex-start" , justifyContent : "flex-end" , "maxWidth" : "30vw" , "marginLeft" : "auto" , marginTop : "1vw"  } : { display: "flex", alignItems : "flex-start" , justifyContent : "flex-start" , "maxWidth" : "30vw" , "marginRight" : "auto"  , marginTop : "1vw" }}>
        
        {draw && fileMsg.type !== "wav" && fileMsg.type !== "mp4" ? (
        
        <div className="modal-overlay">

            <div className="modal-container canvas">

              <div className="overlay-modal-header header">

                <button className="cancel-button" onClick={handleCancel}>
                  <CloseIcon />
                </button>{" "}

              </div>

              <canvas key="dataViewer" ref={contextRef} />

              <div className="modal-container footer">
                {page !== 1 && draw ? (
                  <button onClick={handlePreviousPage}>previous page</button>
                ) : (
                  ""
                )}
                {draw && isNextPageAvaileble ? (
                  <button onClick={handleNextPage}>next page</button>
                ) : (
                  ""
                )}
              </div>

            </div>

          </div>
        ) : (
          ""
        )}

          {own && message.hiddenFor.length === 0 && <button onClick={() => {setShowForwardMsgModal(true) ; setForwardedMsg(message)}} className={`${isHiddenMode && "forwardIcon-dark"} ${!isHiddenMode && "forwardIcon" }`}>
            <RedoIcon onClick={() => setMsgForwObj(message)} className="svg-style" />
          </button>
          }
          
        <div onContextMenu={() => resetHiddenMsg(message)} onDoubleClick={() => {user.isAdmin && cuurentChat.isGroup && !fileMsg && hidePrevMsg(message)}} className={`${msgHiddenForArr && msgHiddenForArr?.length > 0  ? "message isHiddenMsg" : "message" } ${own ? "own" : ""}`} id={message._id}>
          
          {own ? (
            
            <div className="messageImgParent">
            
              <div className="messageBottom">{format(message.createdAt)}</div>
              
              <p className="ownerName">Me ({user.username})</p>

              <img
                className="messageImg"
                src={user?.avatar || profilePic}
                alt=""
              />

            </div>
 
          ) : (
            <div className="messageImgParent">

              <div className="msg-image-container">
                <img
                  className="messageImg"
                  src={singleChatConverImg || profilePic} // Use the sender's avatar here
                  alt=""
                />
              </div>
              
              <div className="senderInfo">
                <span className="firstNameChar">{senderUsername.charAt(0)}</span>
                <p className="senderUsername">{senderUsername}</p>
              </div>

              <div className="messageBottom">{format(message.createdAt)}</div>

              {/* <div>
                <CheckIcon
                  className={`checkIcon ${senderId === user._id && "show"}`}
                />

                <CheckIcon
                  className={`checkIconDouble ${senderId === user._id && "show"}`}
                />

              </div> */}

            </div>
          )}
          <div className="messageTop">

            {message.file !== null ? (
              filePressed ? (
                <>
                  {/** Delete and edit icons for admin */}
                  {own && user.isAdmin ? (

                    <div className="containerMsg">

                      {/* {
                        !fileMsg &&
                      } */}
                      {/* <DeleteIcon
                        onClick={(e) =>
                          deleteMessage(e, message._id, message.conversationId)
                        }
                      /> */}

                      {!fileMsg ? (
                        <EditIcon className="svg-style" onClick={(e) => setIsEditMode(!isEditMode)} />
                      ) : (
                        false
                      )}

                    </div>

                  ) : (
                    false
                  )}

                  {/** Download button for admin */}
                  {user.isAdmin && !fileMsg.isUploading && fileMsg.isUploaded ? (

                    <button
                      className="downloadFileButton downloadFileButton-custom"
                      onClick={(e) => {
                        downloadFileById(e, fileMsg);
                      }}
                    >
                      Download
                    </button>
                  ) : (

                    false
                  )}

                  {!fileMsg?.isUploading &&
                  fileMsg.isUploaded &&
                  fileMsg?.type?.includes("wav") ? (
                    <AudioPlayer
                      src={` http://localhost:5000/api/v1/message/file/binary?fileId=${fileMsg._id}&page=${page}`}
                      className="audioMsg"
                    />
                  ) : !fileMsg?.isUploading &&
                    fileMsg.isUploaded &&
                    fileMsg?.type?.includes("mp4") ? (
                    <div>
                      <video className="video-msg" width="250" height="160" controls>
                        <source
                          //http://localhost:5000/api/v1/message/file/binary?fileId=${fileMsg._id}&page=${page}
                          src={` http://localhost:5000/api/v1/message/file/binary?fileId=${fileMsg._id}&page=${page}`}
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  ) : fileMsg?.isUploading ? (
                    <div>
                      {fileMsg?.isUploading && fileMsg && fileMsg.filename}{" "}
                      <InsertDriveFileIcon className="fileIcon" />
                      {user._id === message.sender ? (
                        <CloseIcon
                          onClick={() => handleCancelUpload(message.file)}
                        />
                      ) : (
                        false
                      )}
                      <CircularProgress />
                    </div>
                  ) : fileMsg?.isUploaded ? (
                    <div
                      onClick={(e) => {
                        loadImage();
                        setDraw(true);
                      }}
                      className="fileText opened-file-name"
                    >
                      {!fileMsg?.isUploading && fileMsg && fileMsg.filename}{" "}
                      {fileMsg.type === "mp4" && <OndemandVideoIcon className="svg-style" />}
                      {fileMsg.type === "png" || fileMsg.type === "jpg" || fileMsg.type === "jpeg" && <ImageIcon className="svg-style" />}
                      {fileMsg.type === "wav" && <GraphicEqIcon className="svg-style" />}
                      {/* <InsertDriveFileIcon className="fileIcon" />{" "} */}
                    </div>
                  ) : (
                    <div className="canceled-file">
                      {fileMsg && fileMsg.filename}

                      {"Is canceled and failed to be uploaded"}
                    </div>
                  )}
                  {/* <><CheckIcon className={`checkIcon ${senderId === user._id  && "show"}`}/><CheckIcon className={`checkIconDouble ${senderId === user._id  && "show"}`}/></>  */}
                </>
              ) : (
                <div className="file-msg">
                  <button onClick={handleFilePressed}>
                    File By {own ? user.username : senderUsername}
                    <InsertDriveFileIcon className="fileIcon" />
                    <DownloadIcon className="svg-style" />
                  </button>
                </div>
              ) 
            ) : (
              <div style={{ display: "flex" , alignItems : "baseline" , padding : "5px"}}>
 
                <p className={`messageText ${message.text.length > 160 && "hiddenText"} ${seeMoreMsg && "resteHiddenMsgText"}`}>
                  {/* edit or delete message*/}
                  {isEditMode ? (
                    <div className="edit-msg-container">
                      <input className="edit-msg-input" value={newText} onChange={handleOnNewTextChange} />
                      <button className="cancel-edit-msg" onClick={(e) => setIsEditMode(false)}>
                        <CloseIcon />
                      </button>
                      <button
                        className="cancel-edit-msg"
                        onClick={(e) => {
                          setIsEditMode(false);
                          updateMessage(e, message._id, message.conversationId);
                        }}
                      >
                        <SaveIcon className="svg-style" />
                      </button>
                    </div>
                  ) : (
                    <div className="all-message-text">
                      <p className="messageText">{message?.text} </p> 
                      {message?.isForwarded && <span className="Forwarded-msg">Forwarded</span>}
                    </div>
                  )}
                </p>

              
              </div>

            )}

          </div>
              {own && user.isAdmin ? (
                  <div className={`msg-edit-icons ${isHiddenMode || message?.hiddenFor?.length > 0 && "msg-edit-icons-dark"} ${isHiddenMode && message?.hiddenFor?.length > 0 && "msg-edit-icons-dark" }`}>
                    <DeleteIcon
                    className="svg-style"
                      onClick={(e) =>
                        deleteMessage(e, message._id, message.conversationId)
                      }
                    />
                    {!fileMsg && !isEditMode ? (
                      <>
                      <EditIcon className="svg-style" onClick={(e) => setIsEditMode(!isEditMode)} />
                      {msgStateObj.isFavorite ? <StarIcon onClick={() => removeFavoriteMsg(message)} className="svg-style"/> : <StarOutlineIcon onClick={() => favortiteMsg(message)} className="svg-style"/>}
                      {msgHiddenForArr?.length === cuurentChat?.members?.length - 1 && archivedMsg?._id !== message?._id ? <RemoveRedEyeIcon className="svg-style" onClick={() => resetArchivedMsg(message)}/> : <VisibilityOffIcon className="svg-style" onClick={() => archiveMsg(message)} />}                    
                      </>
                    ) : (
                      false
                    )}
                  </div>
                ) : (
                  false
                )} 
          
            {message?.text?.length > 160 && !seeMoreMsg && !isEditMode && <button onClick={() => setSeeMoreMsg(true)} className="seeMoreMsgButton">see more</button>}
            {message?.text?.length > 160 && seeMoreMsg && !isEditMode && <button onClick={() => setSeeMoreMsg(false)} className="seeMoreMsgButton">show less</button>}
        
          <div>

          </div>


          {showForwardMsgModal && msgStateObj && msgStateObj?._id === msgForwObj?._id &&
          <ForwardMessageModal
            setShowForwardMsgModal={setShowForwardMsgModal}
            conversation={conversation}
            messageFromMessage={msgStateObj}
            setConversation={setConversation}
            setArrivalMessages={setArrivalMessages}
          />}


        </div>

          {openApprovalModal && <ApprovalModal hiddenFor={hiddenFor} setHiddenFor={setHiddenFor}  prevMsg={prevMsg} setMsgHiddenForArr={setMsgHiddenForArr} setOpenApprovalModal={setOpenApprovalModal} message={message} cuurentChat={cuurentChat} setPrevMsg={setPrevMsg} />}
          
          {openFavortieMessagesModal && <FavoriteMessages 
                setOpenFavortieMessagesModal={setOpenFavortieMessagesModal} 
                cuurentChat={cuurentChat}
                msgStateObj={msgStateObj}
                setMsgStateObj={setMsgStateObj}
                messages={messages}        
              />}

      </div>
    
    </>
  );
};


export default Message;
