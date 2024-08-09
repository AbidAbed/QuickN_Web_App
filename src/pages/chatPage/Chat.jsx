import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
// import "./chat.scss";
import Conversation from "../../components/conversation/Conversation";
import Message from "../../components/message/Message";
import Announcement from "../../components/announcement/Announcement";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CircularProgress from "@mui/material/CircularProgress";
import AnnouncementModal from "../../components/announcementModal/AnnouncementModal";
import AnnouncementViewModal from "../../components/announcementViewModal/AnnouncementViewModal";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import MicOffIcon from "@mui/icons-material/MicOff";
import socket from "../../socketConfig";
import Group from "../../components/group/Group";
import CreateGroup from "../../components/createGroup/CreateGroup";
import CreateChat from "../../components/createChat/CreateChat";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { green } from "@mui/material/colors";
import GroupNameChanger from "../../components/ChangeGroupNameModal/GroupNameChanger";
import image from "../../assets/images/ArtboardSmallBackground.svg";
import { toast } from "react-toastify";
import profilePic from "../../assets/images/profile.png";
import GroupInfoModal from "../../components/groupInfoModal/GroupInfoModal";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import groupPic from "../../assets/images/groupPic.jpg";
import AnnouncementCheckedMembersInfo from "../../components/AnnouncementCheckedMembersInfo/AnnouncementCheckedMembersInfo";
import HiddenGroupMembers from "../../components/hiddenGroupMembers/HiddenGroupMembers";
import { binarySearch } from "../../utils/binarySearch";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import ForwardMessageModal from "../../components/forwardMessageModal/ForwardMessageModal";
import LockIcon from '@mui/icons-material/Lock';
import NoEncryptionGmailerrorredIcon from '@mui/icons-material/NoEncryptionGmailerrorred';
import SendIcon from '@mui/icons-material/Send';
import LogOutFromOtherDevices from "../../components/LogoutFromOtherDevices";
import { Link } from "react-router-dom";
import StarsIcon from '@mui/icons-material/Stars';
import FavoriteMessages from "../../components/favoriteMessages/FavoriteMessages";



const Chat = () => {
  const {
    user,
    selectedSearchedMessage,
    conversationNames,
    addConversationName,
    token,
    addConversationNames,
    setSelectedSearchedMessage,
    showLogoutFromOtherDevicesModal
  } = useAppContext();

  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const sendMsgref = useRef(null)

  const audioRecorderRef = useRef(null);
  const [isInitialMessagesFetch, setIsInitialMessagesFetch] = useState(false);

  const [isAudioUploading, setIsAudioUploading] = useState(false);

  const [conversation, setConversation] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cuurentChat, setCurrentChat] = useState(null);
  const [arrivalMessages, setArrivalMessages] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const [openAnnouncementInfo, setOpenAnnouncementInfo] = useState(false);
  const [openedAnnouncementObj, setOpenedAnnouncementObj] = useState({});

  const [newMessage, setNewMessage] = useState("");

  const [file, setFile] = useState(null);

  const scrolRef = useRef();

  const fileInputref = useRef(null);

  const [openModal, setOpenModal] = useState(false);

  const [seen, setSeen] = useState(false);

  const [groupInfoId, setGroupInfoId] = useState();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [voice, setVoice] = useState(null);

  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);

  const [newAnnouncementAdded, setNewAnnouncementAdded] = useState(false);
  const [checked, setChecked] = useState(false);

  const [announcementDocNumDefault, setAnnouncementDocNumDefault] =
    useState(null);

  const [announcementDocInitialNum, setAnnouncementDocInitialNum] =
    useState(null);

  const [announcementDocNum, setAnnouncementDocNum] = useState(null);

  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false);

  const [openCreateNewChatModal, setOpenCreateNewChatModal] = useState(false);

  const [conversationFileUpload, setConversationFileUpload] = useState("");

  const [searchedConversations, setSearchedConversations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  // const [centeredMessageId, setCenteredMessageId] = useState(null);

  const [topMessageId, setTopMessageId] = useState(null);
  const [bottomMessageId, setBottomMessageId] = useState(null);

  const [isTopReached, setIsTopReached] = useState(null);
  const [isEndReached, setIsEndReached] = useState(null);

  const [isMessageIdFromSearch, setIsMessageIdFromSearch] = useState(false);

  const [isNoTop, setIsNoTop] = useState(false);
  const [isNoEnd, setIsNoEnd] = useState(false);

  const [selectedGroupName, setSelectedGroupName] = useState("");

  const [isNewConversation, setIsNewConversation] = useState(false);
  // const [isCurrentChatChanged, setIsCurrentChatChanged] = useState(false);

  const [groupMenueIsDisplayed, setGroupMenueIsDisplayed] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [freezGroupResponse, setFreezGroupResponse] = useState(false);

  const [existInGroupMembers, setExistInGroupMembers] = useState([]);

  const [membersGroupInfo, setMembersGroupInfo] = useState([]);

  const [groupNameChanger, setGroupNameChanger] = useState(false);

  const [showForwardMsgModal, setShowForwardMsgModal] = useState(false);

  const [groupNameChangerConversationId, setGroupNameChangerConversationId] =
    useState(null);

  const [openGroupInfoModal, setOpenGroupInfoModal] = useState(false);

  const [isConversationClicked, setIsConversationClicked] = useState(false);

  const [isMessageFromSocket, setIsMessageFromSocket] = useState(false);
  const [
    conversationIdToAddMembersForGroup,
    setConversationIdToAddMembersForGroup,
  ] = useState(null);

  const [isVoiceRecordingCanceld, setIsVoiceRecordingCanceld] = useState(false);

  const [fileBinary, setFileBinary] = useState(null);

  const scrollContainerRef = useRef(null);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
  }

  useEffect(() => {
    if (searchTerm !== "") {
      setSearchedConversations([
        ...conversation.filter((con) => {
          return conversationNames[con._id].name.includes(searchTerm);
        }),
      ]);
      // ////console.log([
      //   ...conversation.filter((con) => {
      //     return conversationNames[con._id].name.includes(searchTerm);
      //   }),
      // ]);
      // ////console.log(conversationNames);
    } else setSearchedConversations([]);
  }, [searchTerm]);

  const [isAudioRecorderMounted, setIsAudioRecorderMounted] = useState(true);
  useEffect(() => {
    setIsAudioRecorderMounted(false);
    setIsRecording(false);

    async function removeAudioIcon() {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(audioStream);
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    }

    removeAudioIcon();
  }, [cuurentChat]);

  // const startRecording = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  //     // Check if permission is granted
  //     if (stream) {
  //       mediaRecorder.current = new MediaRecorder(stream);

  //       mediaRecorder.current.ondataavailable = (event) => {
  //         audioChunks.current.push(event.data);
  //       };

  //       mediaRecorder.current.onstop = () => {
  //         const recordedAudioBlob = new Blob(audioChunks.current, {
  //           type: "audio/wav",
  //         });
  //         setAudioBlob(recordedAudioBlob);

  //         uploadFile(recordedAudioBlob);

  //         setVoice(recordedAudioBlob);
  //         audioChunks.current = [];
  //       };

  //       mediaRecorder.current.start();
  //       setIsRecording(true);
  //     } else {
  //       setIsRecording(false);
  //     }
  //   } catch (err) {
  //     //////console.log(err);
  //     setIsRecording(false);
  //   }
  // };

  // const stopRecording = () => {
  //   if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
  //     mediaRecorder.current.stop();
  //     setIsRecording(false);
  //     setIsAudioUploading(true);
  //   }
  // };

  const handleCancelUpload = () => { };

  const uploadVoice = async (blob) => {
    if (blob && !isVoiceRecordingCanceld) {
      const formData = new FormData();
      formData.append("file", blob, "audio.wav");

      try {
        // const response = await axiosObj.post(`/message/upload`, formData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //     token_header: `Bearer ${token}`,
        //   },
        // });
        setAudioBlob(blob);

        uploadFile(blob);

        setVoice(blob);

        setIsAudioUploading(true);

        setConversationFileUpload(cuurentChat._id);
        // setAudioBlob(null);
      } catch (err) {
        toast.error(err.response.data.msg, toastOptions);
      }
    } else setIsVoiceRecordingCanceld(false);
  };


  const [onlineText, setOnlineText] = useState("")
  const [onlineUsersObj, setOnlineUsersObj] = useState({})

  // ////////console.log(conversationNames);
  useEffect(() => {
    // start the socket io connection , connect to the socket io port

    socket.on("fileUploaded", ({ senderId, convId, isUploaded, msgId }) => {
      if (
        cuurentChat !== null &&
        cuurentChat._id !== undefined &&
        convId === cuurentChat._id
      ) {
        // const reorderedmessages = messages.filter((msg) => msg._id !== msgId);
        // const msgFile = messages.find((msg) => {
        //   //console.log(msgId, msg._id);
        //   return msg._id === msgId;
        // });

        setMessages([...messages]);
        // setIsEndReached(false);
        // // setIsTopReached(false);
        // setIsNoEnd(false);
        // setIsNoTop(false);
        // setTopMessageId(null);
        // setBottomMessageId(null);
        // setIsNewConversation(true);
        ////console.log(3);
        // setMessages([]);
      }
    });


    socket.on("getMessage", (data) => {
      if (
        cuurentChat === null ||
        !cuurentChat._id ||
        cuurentChat._id !== data.convId ||
        !isConversationClicked
      ) {
        addConversationName({ _id: data.convId, isUnread: true });
      } else {
        addConversationName({ _id: data.convId, isUnread: false });
      }
      setArrivalMessages({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
        file: data.file,
        convId: data.convId,
        senderUsername: data.senderUsername,
        _id: data._id,
        createdAt: data.createdAt,
        senderAvatar: data.senderAvatar,
        isForwarded: data.isForwarded
      });

      // return the conversation that get the new message
      const theLatestConversation = conversation.filter((conver) => {
        return data.convId === conver._id
      })

      // return the other conversation that we dont get a new message inside it
      const othersConversation = conversation.filter((conver) => {
        return data.convId !== conver._id
      })

      // merge them , update the state
      setConversation([...theLatestConversation, ...othersConversation])

    });


  }, [arrivalMessages, cuurentChat, messages, conversation]);



  useEffect(() => {

    socket.on(
      "announcementSign",
      ({ userId, userName, signTime, announcementId, checkedUserObjectId }) => {
        if (announcements.length === 0) return;
        const [foundAnnouncement] = announcements.filter(
          (announcement) => announcement._id === announcementId
        );
        const otherAnnouncements = announcements.filter(
          (announcement) => announcement._id !== announcementId
        );

        if (foundAnnouncement !== undefined) {

          setAnnouncements([
            ...otherAnnouncements,
            {
              ...foundAnnouncement,
              checkedUsers: [
                ...foundAnnouncement?.checkedUsers,
                {
                  userId: userId,
                  username: userName,
                  checkedAt: signTime,
                  _id: checkedUserObjectId,
                },
              ],
            },
          ]);

          if (openAnnouncementInfo && openedAnnouncementObj._id === foundAnnouncement._id) {
            setOpenedAnnouncementObj({
              ...openedAnnouncementObj,
              checkedUsers: [
                ...openedAnnouncementObj.checkedUsers,
                {
                  userId: userId,
                  username: userName,
                  createdAt: signTime,
                  _id: checkedUserObjectId,
                },
              ],
            });
          }
        }

      }
    );

  }, [announcements, openedAnnouncementObj]);


  useEffect(() => {

    socket.on("getHiddenMsg", async (newMsg) => {
      try {
        const messagesAfterHidden = await binarySearch(JSON.parse(JSON.stringify(messages)), newMsg)
        setMessages(messagesAfterHidden)
      } catch (error) {
        console.error("Error updating messages:", error);
      }
    })

  }, [arrivalMessages, messages])



  useEffect(() => {
    if (
      arrivalMessages &&
      cuurentChat &&
      cuurentChat._id &&
      cuurentChat?.members.includes(arrivalMessages.sender) &&
      cuurentChat?._id === arrivalMessages.convId
    ) {
      setMessages((prev) => [...prev, arrivalMessages]);
      setBottomMessageId(arrivalMessages._id);
      setIsMessageFromSocket(true);
    }
  }, [arrivalMessages, cuurentChat]);



  // useEffect(() => {
  //   getUserConversation();
  // }, [cuurentChat]);

  // Detecting closing the website



  useEffect(() => {
    // 'abortControlleris' is used to drop all connections
    const abortController = new AbortController();

    // When user tries to close the website
    const handleTabClose = (event) => {
      const message = "Are you sure you want to exit?";
      event.returnValue = message;

      // Abort ongoing operations by signaling the AbortController
      abortController.abort();

      return message;
    };

    const handleBeforeUnload = () => {
      // Disconnect your socket or perform other cleanup actions here

      // Additional cleanup: abort ongoing fetch requests or other asynchronous operations
      abortController.abort();

    };

    window.addEventListener("beforeunload", handleTabClose);
    window.addEventListener("unload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      window.removeEventListener("unload", handleBeforeUnload);
    };
  }, []);


  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    // send event to the server from the client


    socket.on("startConversation", ({ senderId, convId }) => {
      getUserConversation();
      getAllUserGroups();
      // ////////console.log(convId);
      addConversationName({ _id: convId, isUnread: false });
    });

    socket.on("groupIsUpdated", (senderId) => {
      //////console.log(50000);
      getAllUserGroups();
      getUserConversation();
    });

    socket.on("addedToGroup", ({ senderId, convId, addedMemberId }) => {
      getAllUserGroups();
      getUserConversation();
      ////////console.log(convId);
      if (cuurentChat !== null && cuurentChat.id && cuurentChat.id !== convId)
        addConversationName({ _id: convId, isUnread: true });
    });

    socket.on("removedFromGroup", ({ senderId, convId, removedUserId }) => {
      getUserConversation();
      if (
        cuurentChat !== null &&
        cuurentChat._id &&
        cuurentChat._id === convId
      ) {
        if (removedUserId === user._id)
          setCurrentChat(null);
      }
      ////////console.log(convId);
      addConversationName({ _id: convId, isUnread: false });
    });

    socket.on("broadcastAnnouncement", () => {
      getAnnouncements();
    });
  }, [user, cuurentChat]);


  useEffect(() => {
    // Assuming 'socket' is initialized and connected properly
    socket.on("messageDeleted", ({ senderId, conversationId, message_id }) => {
      //console.log({
      //   senderId,
      //   conversationId,
      //   message_id,
      // })
      if (cuurentChat?._id === conversationId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== message_id)
        );
      }
    });
    // Don't forget to clean up the socket on component unmount
    return () => {
      socket.off("messageDeleted");
    };

  }, [cuurentChat]); // Include 'currentChat' in the dependency array if it's used inside the useEffect



  useEffect(() => {
    // Assuming 'socket' is initialized and connected properly
    socket.on(
      "updatedMessage",
      ({ senderId, conversationId, message_id, newText }) => {
        if (cuurentChat?._id === conversationId) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              // ////////console.log(msg);
              if (msg._id === message_id) msg.text = newText;
              return msg;
            })
          );
        }
      }
    );


    // Don't forget to clean up the socket on component unmount
    return () => {
      socket.off("messageDeleted");
    };

  }, [cuurentChat]); // Include 'currentChat' in the dependency array if it's used inside the useEffect



  const getUserConversation = async () => {
    try {
      // get all conversations that the current user id inside it , will return a conversation doc obj
      const response = await axiosObj.get(`/conversation/${user._id}`, {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });
      const convNames = response.data.map((conv) => {
        return {
          _id: conv._id,
          isUnread: conv.isUnread,
        };
      });
      setConversation(response.data);
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };


  useEffect(() => {
    getUserConversation();
    getAllUserGroups();
  }, [user]);


  useEffect(() => {
    if (Object.keys(selectedSearchedMessage).length !== 0) {
      setIsMessageIdFromSearch(true);
      setIsConversationClicked(false);
    }
  }, [selectedSearchedMessage]);


  useEffect(() => {
    if (isMessageIdFromSearch) {
      setCurrentChat({
        _id: selectedSearchedMessage.conversationId,
        isGroup: selectedSearchedMessage.isGroup,
        members: selectedSearchedMessage.members,
      });

      setIsEndReached(false);
      setIsTopReached(false);
      setIsNoEnd(false);
      setIsNoTop(false);
      setTopMessageId(null);
      setBottomMessageId(null);
      setIsNewConversation(true);
      ////console.log(3);
      setMessages([]);
    }
  }, [isMessageIdFromSearch]);


  const handleOnScroll = () => {

    const scrollContainer = scrollContainerRef.current;

    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Check if the user has reached the end (within a threshold)
      // Adjust the threshold as needed

      if (isNewConversation && !isMessageIdFromSearch)
        setIsNewConversation(false);
      else {
        // //console.log(scrollTop , clientHeight , scrollHeight , !isNoEnd);
        if (scrollTop + clientHeight >= scrollHeight - 5 && !isNoEnd) {
          setIsEndReached(true);
        } else if (scrollTop === 0 && !isNoTop) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollTop + 200;
          setIsTopReached(true);
        }
      }
    }
  };

  const getMessages = async () => {
    setIsAudioRecorderMounted(true);
    try {
      // get all messages that are inside the choosen conversation . cuurentChat will contain the conversation doc obj
      let message_id_query = `${isEndReached
        ? "?message_id=" + bottomMessageId
        : isTopReached
          ? "?message_id=" + topMessageId
          : ""
        }`;

      let newer_query = `${isEndReached ? "&newer=true" : isTopReached ? "&newer=false" : ""
        }`;

      if (bottomMessageId === null && topMessageId === null) {
        message_id_query = "";
        newer_query = "";
      }

      // ////////console.log(selectedSearchedMessage);
      if (isMessageIdFromSearch) {
        if (selectedSearchedMessage.isMessage)
          message_id_query = `?message_id=${selectedSearchedMessage.messageId}`;
        else message_id_query = ``;
        newer_query = "";
        // setIsMessageIdFromSearch(false);
        // setSelectedSearchedMessage({});
      }
      const response = await axiosObj(
        `/message/${cuurentChat?._id}${message_id_query}${newer_query}`,
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      //should check isEndReached && isTopReached
      if (
        response.data.length !== 0 &&
        topMessageId === null &&
        bottomMessageId === null
      ) {
        setTopMessageId(response.data[0]._id);
        setBottomMessageId(response.data[response.data.length - 1]._id);
        setMessages(response.data);

        // if (!isMessageIdFromSearch)
        //   scrollContainerRef.current.scrollTop =
        //     scrollContainerRef.current.scrollTop +
        //     scrollContainerRef.current.clientHeight;

        if (response.data.length !== 0) {
          if (isTopReached) {
            setIsNoTop(true);
            setIsTopReached(false);
          }
          if (isEndReached) {
            setIsNoEnd(true);
            setIsEndReached(false);
          }
        }
      }

      if (isEndReached && topMessageId !== null && bottomMessageId !== null) {
        setIsEndReached(false);
        // if (!isMessageIdFromSearch) scrollContainerRef.current.scrollTop = 150;
        if (response.data.length !== 0) {
          setMessages([...messages, ...response.data]);
          setBottomMessageId(response.data[response.data.length - 1]._id);
        } else setIsNoEnd(true);
      }
      if (isTopReached && topMessageId !== null && bottomMessageId !== null) {
        setIsTopReached(false);
        // if (!isMessageIdFromSearch)
        //   scrollContainerRef.current.scrollTop =
        //     scrollContainerRef.current.scrollTop +
        //     scrollContainerRef.current.clientHeight;
        if (response.data.length !== 0) {
          setMessages([...response.data, ...messages]);
          setTopMessageId(response.data[0]._id);
        } else setIsNoTop(true);
      }
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };

  useEffect(() => {
    //if isInitial , isSearch don't auto scroll
    // //console.log(isConversationClicked);
    if (
      (isConversationClicked && isMessageFromSocket) ||
      isConversationClicked
    ) {
      scrollToMessage(bottomMessageId);
      setIsMessageFromSocket(false);
    }
  }, [bottomMessageId]);

  const scrollToMessage = (elementId) => {
    const element = document.getElementById(elementId);

    //////console.log(element);

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
  // ////////console.log("isNoEnd : ", isNoEnd, ", isNoTop:", isNoTop);

  //////////////////////////////////////////////////////////////
  //SHOULD BE COMMENTED
  useEffect(() => {
    if ((isEndReached && !isNoEnd) || (isTopReached && !isNoTop)) {
      ////console.log(1);
      getMessages();
    }
  }, [isEndReached, isTopReached]);
  ////////////////////////////////////////////////////////////

  ////////console.log(5000,conversationNames)
  useEffect(() => {
    // ////////console.log(5555,cuurentChat)
    if (cuurentChat !== null && cuurentChat._id !== undefined) {
      //////console.log(conversationNames);
      if (
        Object.entries(conversationNames).length !== 0 &&
        conversationNames[cuurentChat._id]?.isUnread
      )
        addConversationName({ _id: cuurentChat._id, isUnread: false });
      // ////console.log(cuurentChat, conversationNames);
      setIsEndReached(false);
      setIsTopReached(false);
      setIsNoEnd(false);
      setIsNoTop(false);
      setTopMessageId(null);
      setBottomMessageId(null);
      setIsNewConversation(true);
      ////console.log(4);
      setMessages([]);
    }
  }, [cuurentChat]);

  useEffect(() => {
    if (
      isNewConversation &&
      cuurentChat !== null &&
      cuurentChat._id !== undefined
    ) {
      getMessages();
      setIsNewConversation(false);
    }
  }, [isNewConversation]);
  // ////////console.log(
  //   "bottomMessageId :",
  //   bottomMessageId,
  //   ", topMessageId : ",
  //   topMessageId
  // );
  const [shouldFetchAnnouncements, setShouldFetchAnnouncements] =
    useState(true);

  const getAnnouncements = async () => {
    try {
      const response = await axiosObj.get("/announcement", {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });
      setAnnouncements(response.data);
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };

  useEffect(() => {
    getAnnouncements();

    //fix getAnnouncements , infinte rendering
  }, []);

  // require('path')
  // const [group , setGroup] = useState(null)

  // useEffect(() => {

  //   const getGroup = async () => {
  //     try {
  //       const response = await axiosObj.get(`/group/getGroup/${cuurentChat?._id}`)
  //       // ////////console.log(response.data)
  //       setGroup(response.data)
  //     } catch (error) {
  //       ////////console.log(error)
  //     }
  //   }

  //   getGroup()

  // } , [cuurentChat , user])

  // ////////console.log(group)
  // ////////console.log(cuurentChat)

  const [userGroups, setUserGroups] = useState([]);

  const getAllUserGroups = async () => {
    try {
      const response = await axiosObj.get(
        `/group/getAllUserGroups/${user._id}`,
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      setUserGroups(response.data);
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };

  // useEffect(() => {

  //   const countAnnouncementDocNum = async () => {
  //     try {
  //       const response = await axiosObj.get("/announcement/getAnnouncement")
  //       setAnnouncementDocNum(announcementDocNumDefault + 1)
  //     } catch (error) {
  //       ////////console.log(error)
  //     }
  //   }

  //   countAnnouncementDocNum()

  // } , [announcementDocNumDefault])

  // useEffect(() => {

  //   const countAnnouncementDocNum = async () => {
  //     try {
  //       const response = await axiosObj.get("/announcement/getAnnouncement")
  //       setAnnouncementDocNumDefault(response.data)
  //     } catch (error) {
  //       ////////console.log(error)
  //     }
  //   }

  //   countAnnouncementDocNum()

  // } , [])

  const uploadFileOnly = async (e, formData, members, convId) => {
    try {
      const response = await axiosObj.post(`/message/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token_header: `Bearer ${token}`,
        },
      });

      // members.map((recId) => {
      //   socket.emit("fileUploaded", {
      //     senderId: user._id,
      //     receiverId: recId,
      //     isUploaded: true,
      //     convId: convId,
      //     msgId: response.data._id,
      //   });
      // });
    } catch (err) { }
  };

  //////////////////////////////////////////////////////////////////

  const [isHiddenMode, setIsHiddenMode] = useState(false)
  const [hiddenFor, setHiddenFor] = useState([])
  const [openHiddenGroupMembersModal, setOpenHiddenGroupMembersModal] = useState(false)


  useEffect(() => {
    setHiddenFor([])
    setIsHiddenMode(false)
  }, [cuurentChat])

  
  useEffect(() => {
    setHiddenFor(hiddenFor)
  }, [hiddenFor])


  useEffect(() => {
    setNewMessage("")
  } , [cuurentChat])


  // const encryptMessage = async (message) => {
  //   try {
  //     let messageText = message;
  
  //     // If message is an object, extract the string value
  //     if (typeof message === 'object') {
  //       messageText = message.message; // Assuming message is stored in the 'message' property
  //     }
  
  //     if (typeof messageText !== 'string') {
  //       throw new TypeError('Message must be a string');
  //     }
  
  //     console.log(messageText);
  
  //     const response = await axiosObj.post('/message/encrypt-message', { message: messageText });
  //     return response.data.encryptedMessage;

  //   } catch (error) {
  //     console.error('Encryption request failed:', error);
  //     throw new Error('Encryption failed');
  //   }
  // };
  

  // const handleMsgSend = async (e, conversation) => {
  //   if (e) e.preventDefault();
    
  //   console.log(typeof newMessage);
  //   // validate that we have a message, not an empty field
  //   if (!newMessage.trim() && !file) {
  //     return toast.info("You can't send an empty message", toastOptions);
  //   }
  
  //   try {
  //     // Encrypt the message text
  //     let messageText = newMessage; // Initialize message text

  //     // Check if newMessage is an object, if so, extract the string value
  //     if (typeof newMessage === 'object') {
  //       messageText = newMessage.message; // Assuming message is stored in the 'message' property
  //     }
  
  //     // Encrypt the message text
  //     const encryptedText = await encryptMessage(messageText);
    
  //     const message = {
  //       sender: user._id,
  //       text: encryptedText,
  //       conversationId: file ? conversationFileUpload : cuurentChat._id,
  //       file: file ? file._id : null,
  //       hiddenFor: user.isAdmin && isHiddenMode && hiddenFor.length > 0 ? hiddenFor : []
  //     };
  
  //     const response = await axiosObj.post("/message", message, {
  //       headers: {
  //         token_header: `Bearer ${token}`,
  //       },
  //     });
  
  //     // Emit message to sockets
  //     cuurentChat.members.forEach((member) => {
  //       if (member !== user._id && !hiddenFor.includes(member)) {
  //         socket.emit("sendMessage", {
  //           senderId: response.data.sender,
  //           receiverId: member,
  //           text: encryptedText,
  //           file: message.file,
  //           convId: response.data.conversationId,
  //           senderUsername: user.username,
  //           _id: response.data._id,
  //           createdAt: response.data.createdAt,
  //           senderAvatar: user.avatar ? user.avatar : profilePic
  //         });
  //       }
  //     });
  
  //     // Upload file if not null
  //     if (file !== null) {
  //       const formData = new FormData();
  //       formData.append("fileId", file._id);
  //       formData.append("file", fileBinary);
  //       uploadFileOnly(e, formData, cuurentChat.members, conversationFileUpload);
  //     }
  
  //     // Update state with new message
  //     if (cuurentChat?._id === response.data.conversationId) {
  //       setMessages([...messages, response.data]);
  //     }
  
  //     // Set bottom message ID
  //     setBottomMessageId(response.data._id);
  //     setIsMessageFromSocket(true);
  //     setNewMessage("");
  //     setFile(null);
  //     setConversationFileUpload(null);
  
  //     // Reset file input field
  //     const fileInput = document.getElementById('fileId');
  //     if (fileInput) {
  //       fileInput.value = '';
  //     }
  
  //   } catch (err) {
  //     toast.error(err.response.data.msg, toastOptions);
  //   }
  // };
  
 
  const handleMsgSend = async (e, conversation) => {
    if (e) e.preventDefault();

    // validate that we have a msg , not an empty field
    if(!newMessage.trim() && !file) return toast.info("you can't send an empty message" , toastOptions)


    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: file ? conversationFileUpload : cuurentChat._id,
      file: file ? file._id : null,
      hiddenFor: user.isAdmin && isHiddenMode && hiddenFor.length > 0 ? hiddenFor : []
    };


    try {
      const response = await axiosObj.post("/message", message, {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });


      const receiverId = cuurentChat.members.filter((member) => {

        const exist = hiddenFor.find((hiddenId) => {
          return hiddenId === member
        })

        if (exist) {
          return false
        } else {
          return true
        }

      }).map((recId) => {
        if (recId !== user._id) {
          socket.emit("sendMessage", {
            senderId: response.data.sender,
            receiverId: recId,
            text: response.data.text,
            file: message.file,
            convId: response.data.conversationId,
            senderUsername: user.username,
            _id: response.data._id,
            createdAt: response.data.createdAt,
            senderAvatar: user.avatar ? user.avatar : profilePic ,
            isForwarded : response.data.isForwarded ? response.data.isForwarded : false
          })
        };
      });


      if (file !== null) {
        const formData = new FormData();

        formData.append("fileId", file._id);
        formData.append("file", fileBinary);

        uploadFileOnly(
          e,
          formData,
          cuurentChat.members,
          conversationFileUpload
        );
      }

      if (cuurentChat?._id === response.data.conversationId)
        setMessages([...messages, response.data]);

      //FIX DUB MESSAGES , SET BOTTOM MESSAGEID
      setBottomMessageId(response.data._id);
      setIsMessageFromSocket(true);
      setNewMessage("");

      setFile(null);
      setConversationFileUpload(null);

      const fileInput = document.getElementById('fileId');

      if (fileInput) {
        fileInput.value = ''; // Reset file input field
      }

    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };


  
  useEffect(() => {
    ////console.log("MESSAGES CHANGED",messages)
  }, [messages]);



  const uploadFile = async (fileObj) => {
    try {
      let fileName;
      if (fileObj.name) {
        fileName = fileObj.name.split(".")[0];
      } else {
        fileName = "quickn" + new Date().toISOString();
      }

      const createFileRecordResponse = await axiosObj.post(
        `/message/createFileObj`,
        { filename: fileName },
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      setFile(createFileRecordResponse.data);


      setFileBinary(fileObj);

      // setIsUploading(false);
      // setIsAudioUploading(false);
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };


  const [filterdAnnouncements, setFilterdAnnouncements] = useState([]);


  useEffect(() => {
    if (file) {
      handleMsgSend();
    }
  }, [file]);



  useEffect(() => {
    getAnnouncements();
  }, [checked]);


  useEffect(() => {
    // //console.log(announcements)
    let filterdAnnouncements = announcements?.filter((announcement) => {
      return !announcement.checkedUsers?.some(
        (check) => check.userId === user._id
      );
    });

    setFilterdAnnouncements(filterdAnnouncements && filterdAnnouncements);

  }, [announcements, user]);


  const [groups, setGroups] = useState(null);


  useEffect(() => {

    const getGroupsData = async () => {

      try {
        // Fetch group details using the conversation ID or group ID
        const response = await axiosObj.get(
          `/group/getAllUserGroups/${user._id}`,
          {
            headers: {
              token_header: `Bearer ${token}`,
            },
          }
        );

        setGroups(response.data); // Assuming this fetches group details

      } catch (err) {
        toast.error(err.response.data.msg, toastOptions);
      }
    };

    getGroupsData();

  }, [conversation]);


  const freezGroup = async (e, conversationId) => {
    try {
      e.preventDefault();
      const response = await axiosObj.delete(
        `/group/deleteGroup/${conversationId}`,
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );

      response.data.map((usrId) => {
        socket.emit("removedFromGroup", {
          senderId: user._id,
          receiverId: usrId,
          convId: conversationId,
          removedUserId: usrId,
        });
        return true;
      });

      setFreezGroupResponse(true);
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };


  const handleAddMembers = async (e, addedGroupMembers, conversationId) => {
    try {
      e.preventDefault();
      const response = await axiosObj.put(
        `/group/updateGroup/${conversationId}`,

        { membersId: [...addedGroupMembers] },
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );

      toast.success("member added successfully", toastOptions);

      setCurrentChat({
        ...cuurentChat,
        members: [...cuurentChat.members, ...addedGroupMembers],
      });
      response.data.map((member) => {
        socket.emit("addedToGroup", {
          senderId: user._id,
          receiverId: member,
          convId: conversationId,
          addedUsersMembersIds: addedGroupMembers,
        });
      });
      socket.emit("addedToGroup", {
        senderId: user._id,
        receiverId: user._id,
        convId: conversationId,
        addedUsersMembersIds: addedGroupMembers,
      });
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };


  const updateGroupSettings = async (
    e,
    { conversationId, groupName, avatar }
  ) => {
    try {
      const formData = new FormData();

      formData.append("file", avatar);

      let avatarResponse;

      if (avatar !== null && avatar !== "") {
        avatarResponse = await axiosObj.post(
          "/message/upload/profilePic",
          formData,
          {
            headers: {
              token_header: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      const response = await axiosObj.put(
        `/group/updateGroup/${conversationId}`,
        {
          newGroupName: groupName,
          avatar: avatarResponse && avatarResponse?.data._id,
        },
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );

      response.data.map((usrId) => {
        socket.emit("groupIsUpdated", {
          senderId: user._id,
          receiverId: usrId,
        });

        return true;

      });
    } catch (err) {
      toast.error(err.response.data.msg, toastOptions);
    }
  };

  /////////////////////////////////////////////////////////////////////////////

  const [usersInGroup, setUsersInGroup] = useState([]);
  const [openGroupInfoTopBar, setOpenGroupInfoTopBar] = useState(false);
  const [groupConvImg, setGroupConvImg] = useState(null);
  const [singleChatConverImg, setSingleChatConverImg] = useState(null);
  const onlineRef = useRef(null)


  useEffect(() => {
    if (cuurentChat && cuurentChat.isGroup) {
      const getUsersInGroup = async (userId) => {
        try {
          const response = await axiosObj.get(`/auth/getUser/${userId}`);
          return response.data;
        } catch (error) {
          //console.log(error);
          return null;
        }
      };

      const fetchUsers = async () => {
        // memberUserPromises var will be an array that contain multi pending promises waiting to be resolved , multi calling to getUsersInGroup() async fun
        const memberUserPromises = cuurentChat.members.map((memberId) =>
          getUsersInGroup(memberId)
        );

        // resolve all pending promises in memberUserPromises array
        const memberUsers = await Promise.all(memberUserPromises);

        setUsersInGroup(memberUsers.filter((user) => user !== null));
      };

      fetchUsers();

      setGroupInfoId(cuurentChat);
    } else if (
      cuurentChat &&
      cuurentChat.isGroup !== undefined &&
      !cuurentChat.isGroup
    ) {
      setUsersInGroup([]);
    }
  }, [cuurentChat]);


  const checkGroupAvatarExists = async (groupConvImg) => {
    try {
      const response = await axiosObj.head(
        `/message/file/binary?fileId=${groupConvImg}&page=1`
      );
      return response.status === 200;
    } catch (error) {
      //console.log(error);
    }
  };


  const loadGroupAvatar = async (groupConvImg, setGroupConvImg) => {
    if (groupConvImg) {
      const exists = await checkGroupAvatarExists(groupConvImg);
      if (exists) {
        setGroupConvImg(
          `http://localhost:5000/api/v1/message/file/binary?fileId=${groupConvImg}&page=1`
        );
      } else {
        setGroupConvImg(groupPic);
      }
    }
  };


  const checkAvatarExists = async (avatarUrl) => {
    try {
      const response = await axiosObj.head(avatarUrl);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };


  const loadAvatar = async (defaultUser, setSingleChatConverImg) => {
    if (defaultUser?.avatar) {
      const exists = await checkAvatarExists(defaultUser?.avatar);
      if (exists) {
        setSingleChatConverImg(defaultUser?.avatar);
      } else {
        setSingleChatConverImg(profilePic);
      }
    }
  };


  useEffect(() => {
    if (cuurentChat && cuurentChat.isGroup) {
      const getGroupConverImg = async () => {
        try {
          const response = await axiosObj.get(
            `/group/getGroup/${cuurentChat._id}`,
            {
              headers: {
                token_header: `Bearer ${token}`,
              },
            }
          );
          loadGroupAvatar(response.data.avatar, setGroupConvImg);
          setGroupConvImg(response.data.avatar);
        } catch (error) {
          //console.log(error);
        }
      };

      getGroupConverImg();
    }
  }, [cuurentChat]);


  useEffect(() => {
    if (cuurentChat && !cuurentChat.isGroup) {
      const singleChatMember = cuurentChat.members.find(
        (memberId) => memberId !== user._id
      );

      const getSingleChatMember = async () => {
        try {
          const response = await axiosObj.get(
            `/auth/getUser/${singleChatMember}`
          );
          loadAvatar(response.data, setSingleChatConverImg);
          setSingleChatConverImg(response.data.avatar);
        } catch (error) {
          //console.log(error);
        }
      };

      getSingleChatMember();
    }
  }, [cuurentChat]);



  //////////////////////////////////////////////////////////////////////

  const fullAnnouncementReport = async (announcements) => {
    try {

      const pdfData =
        announcements &&
        announcements.map((announcement) => ({
          announcementTitle: announcement?.announcementTitle,

          checkedUsers: announcement?.checkedUsers.map((checkedUser) => ({
            username: checkedUser?.username,
            checkedAt: `${new Date(checkedUser.checkedAt).getMonth() + 1
              } / ${new Date(checkedUser.checkedAt).getDate()} / ${new Date(
                checkedUser.checkedAt
              ).getFullYear()} __ ${new Date(checkedUser.checkedAt).getHours() - 12
              } : ${new Date(checkedUser.checkedAt).getMinutes() < 10
                ? `0${new Date(checkedUser.checkedAt).getMinutes()}`
                : new Date(checkedUser.checkedAt).getMinutes()
              } ${new Date(checkedUser.checkedAt).getHours() < 12 ? "am" : "pm"}`,
          })),

          announcement_created_time: `${new Date(announcement?.createdAt).getMonth() + 1
            } / ${new Date(announcement?.createdAt).getDate()} / ${new Date(
              announcement?.createdAt
            ).getFullYear()} __ ${new Date(announcement?.createdAt).getHours() - 12
            } : ${new Date(announcement?.createdAt).getMinutes() < 10
              ? `0${new Date(announcement?.createdAt).getMinutes()}`
              : new Date(announcement?.createdAt).getMinutes()
            } ${new Date(announcement?.createdAt).getHours() < 12 ? "am" : "pm"}`,
        }));

      await axiosObj
        .post("/announcement/generate-full-pdf-report", pdfData, {
          headers: {
            token_header: `Bearer ${token}`,
          },
          responseType: "blob", // to indicate that the response should be treated as a Blob
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data])); // url will contain the pdf file content as a blob obj
          const a = document.createElement("a");
          a.href = url;
          a.download = `announcements-full-report.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.error("Error generating PDF:", error));
    } catch (error) {
      //console.log(error);
    }
  };


  const [prevHiddenMode, setPrevHiddenMode] = useState(false)
  const [prevMsg, setPrevMsg] = useState(null)
  const [funState, setFunState] = useState(null)
  const [openFavortieMessagesModal , setOpenFavortieMessagesModal] = useState(false)

  const handleKeyPressed = (event) => {
    if (event.key === 'Enter') {
      handleMsgSend();
    }
  };
  ///////////////////////////////////////////////////////////////////////

  const [groupCreatorId , setGroupCreatorId] = useState(null)
  const [msgStateObj , setMsgStateObj] = useState()
  
  return (
    <div className="chat">
      {/* {freezGroupResponse ? (
        <span className="upload-success">Group is freezed now</span>
      ) : (
        false
      )} */}
      <div className={`chatMenu ${cuurentChat === null && "close-chat-menu"}`}>
        <div className="chatMenuWrapper">
          <div className="searchInputContainer">
            <input
              type="text"
              placeholder="Search Your Contacts"
              className="chatMenuInput"
              onChange={handleSearchChange}
            />
            <SearchIcon className="searchIcon" />
          </div>

          <div className="mainButtons">
          
            {user.isAdmin ? (
              <button
                onClick={() => setOpenCreateGroupModal((prev) => !prev)}
                className="searchButton"
              >
                create group
              </button>
            ) : (
              false
            )}

            <button
              onClick={() => setOpenCreateNewChatModal((prev) => !prev)}
              className="searchButton start-conv"
            >
              start a chat
            </button>

            <Link to="/contacts">
              <button className="contacts-btn">Contacts</button>
            </Link> 

          </div>

          {conversation &&
            (searchTerm !== "" ? searchedConversations : conversation).map(
              (con, index) => {
                if (con?.isGroup) {
                  return (
                    <div className="groupMenueParent">
                      <div
                        onClick={() => {
                          setCurrentChat(con);
                          setIsConversationClicked(true);
                        }}
                      >
                        <>
                          <Group
                            groups={groups}
                            setConversation={setConversation}
                            conversation={con}
                            conversations={conversation}
                            addConversationName={addConversationName}
                            cuurentChat={cuurentChat}
                            setGroupCreatorId={setGroupCreatorId}
                            setGroupMenueIsDisplayed={setGroupMenueIsDisplayed}
                            setSelectedGroupId={setSelectedGroupId}
                            groupMenueIsDisplayed={groupMenueIsDisplayed}
                            isSelected={
                              cuurentChat && cuurentChat._id === con._id
                            }
                            className={
                              cuurentChat && cuurentChat._id === con._id
                                ? "selectedCon"
                                : "nonSelectedCon"
                            }
                          />
                          
                          {user.isAdmin &&
                            groupMenueIsDisplayed &&
                            selectedGroupId === con._id 
                            ||
                            groupCreatorId === user._id &&
                            groupMenueIsDisplayed &&
                            selectedGroupId === con._id  
                            ? (
                            <>
                              {con.members.length > 1 ? (
                                <button
                                  onClick={(e) => freezGroup(e, con._id)}
                                  className="creatGroupBtn"
                                >
                                  Freez group
                                </button>
                              ) : (
                                false
                              )}
                              <button
                                onClick={() => {
                                  setExistInGroupMembers(con.members);
                                  setIsAddMembersModalOpen(
                                    !isAddMembersModalOpen
                                  );
                                  setConversationIdToAddMembersForGroup(
                                    con._id
                                  );
                                }}
                                className="creatGroupBtn"
                              >
                                Add member
                              </button>{" "}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setGroupNameChanger(!groupNameChanger);
                                  setGroupNameChangerConversationId(con._id);
                                  const [selectedGroup] = Object.entries(
                                    conversationNames
                                  ).filter((conv) => {
                                    return conv[0] === con._id;
                                  });
                                  //////console.log(selectedGroup);
                                  setSelectedGroupName(selectedGroup[1].name);
                                }}
                                className="creatGroupBtn"
                              >
                                Group settings
                              </button>
                              <button
                                onClick={() => {
                                  setOpenGroupInfoModal((prev) => !prev);
                                  setGroupInfoId(con._id);
                                  setMembersGroupInfo(con.members);
                                }}
                                className="creatGroupBtn"
                              >
                                group info
                              </button>
                            </>
                          ) : (
                            false
                          )}
                          
                        </>
                      </div>
    
                    </div>
                  );
                } else {
                  return (
                    <>
                      {/* // con will be the conversation doc obj  */}
                      {/* // set the currentChat state to be the conversation doc obj , after we click on it */}
                      <div
                        onClick={() => {
                          setCurrentChat(con);
                          setIsConversationClicked(true);
                        }}
                      >
                        <Conversation
                          setOnlineText={setOnlineText}
                          onlineRef={onlineRef}
                          messages={messages}
                          cuurentChat={cuurentChat}
                          setCurrentChat={setCurrentChat}
                          key={index}
                          conversation={con}
                          conversations={conversation}
                          currentUser={user}
                          addConversationName={addConversationName}
                          className={
                            cuurentChat && cuurentChat._id === con._id
                              ? "selectedCon"
                              : "nonSelectedCon"
                          }
                          isSelected={
                            cuurentChat && cuurentChat._id === con._id
                          }
                        />
                      </div>
                    </>
                  );
                }
              }
            )}
          {/* <img className="artImg" src={image} /> */}
        </div>
      </div>

      <div className={`chatBox ${cuurentChat !== null && isHiddenMode && hiddenFor.length > 0 && "dark-chat-bg"} ${cuurentChat !== null && !isHiddenMode && "chat-bg"}`}>

        <h1 className="watermark">
          {user.email} {user.username}
        </h1>

        <div className="chatBoxWrapper">

          {cuurentChat && cuurentChat._id ? (
            <>
              <div
                className={`chatBoxTop ${isHiddenMode && hiddenFor?.length > 0 && "hiddenConversationColor"}`}
                ref={scrollContainerRef}
                onScroll={handleOnScroll}
                onLoad={() => {
                  // if (!isMessageIdFromSearch)
                  //   scrollContainerRef.current.scrollTop =
                  //     scrollContainerRef.current.scrollTop +
                  //     scrollContainerRef.current.clientHeight;
                }}
              >


                {/* topbar */}

                <div className="topBar">

                  <div className="convName">
                    {conversationNames[cuurentChat._id]?.name}
                    <div className="status">{!cuurentChat.isGroup && conversationNames[cuurentChat._id]?.isOnline}</div>
                    {!cuurentChat.isGroup ? conversationNames[cuurentChat._id]?.isOnline === "online" ? <span className="onlineCircle"></span> : <span className="offCircle"></span> : ""}
                    {user.isAdmin && <span onClick={() => setOpenFavortieMessagesModal(true)}><StarsIcon className="svg-style"/></span>}
                  </div>

                  <div
                    onClick={() => setOpenGroupInfoModal(true)}
                    className="groupMembersNames"
                  >
                    {usersInGroup &&
                      usersInGroup.map((userInGroup, index) => {
                        return (
                          <>
                            <span className="groupMemberName" key={userInGroup?._id}>
                              {userInGroup?.username}
                            </span>
                            {index !== usersInGroup.length - 1 && <span className="groupMemberName">, </span>}
                          </>
                        );
                      })}
                  </div>

                  {cuurentChat && cuurentChat.isGroup && (
                    <div className="msg-image-container">
                      <img
                        className="groupImgTopBar"
                        src={groupConvImg ? groupConvImg : groupPic}
                      />
                    </div>
                  )}

                  {cuurentChat && !cuurentChat.isGroup && (
                  <div className="msg-image-container">
                    <img
                      className="groupImgTopBar"
                      src={singleChatConverImg ? singleChatConverImg : profilePic}
                    />
                  </div>
                  )}

                </div>

                <>
                
                </>
                {messages &&
                  messages.length !== 0 &&
                  messages.map((message, index) => {
                    return (

                      <>
                      {/* // send a two props to the Message component : 1- the message doc object , a boolean props called own to check of the cuurentUser is a sender or a receiver */}
                      <div ref={scrolRef}>
                        <Message
                          isHiddenMode={isHiddenMode}
                          setIsHiddenMode={setIsHiddenMode}
                          setHiddenFor={setHiddenFor}
                          hiddenFor={hiddenFor}
                          setOpenHiddenGroupMembersModal={setOpenHiddenGroupMembersModal}
                          openHiddenGroupMembersModal={openHiddenGroupMembersModal}
                          setPrevHiddenMode={setPrevHiddenMode}
                          setPrevMsg={setPrevMsg}
                          prevMsg={prevMsg}
                          setFunState={setFunState}
                          conversationNames={conversationNames}
                          usersInGroupChat={usersInGroup}
                          setOpenGroupInfoModal={setOpenGroupInfoModal}
                          groupConvImg={groupConvImg}
                          singleChatConverImg={message.senderAvatar}
                          messages={messages}
                          showForwardMsgModal={showForwardMsgModal}
                          setShowForwardMsgModal={setShowForwardMsgModal}
                          conversation={conversation}
                          setConversation={setConversation}
                          currentUser={user}
                          cuurentChat={cuurentChat}
                          seen={seen}
                          setSeen={setSeen}
                          scrolRef={scrolRef}
                          key={index}
                          voice={voice}
                          file={file && file}
                          message={message}
                          own={message.sender === user._id}
                          senderUsername={message.senderUsername}
                          isFromSearchId={
                            selectedSearchedMessage.messageId
                              ? selectedSearchedMessage.messageId
                              : undefined
                          }
                          scrollContainerRef={scrollContainerRef}
                          bottomMessageId={bottomMessageId}
                          isMessageIdFromSearch={isMessageIdFromSearch}
                          setIsMessageIdFromSearch={setIsMessageIdFromSearch}
                          openFavortieMessagesModal={openFavortieMessagesModal}
                          setOpenFavortieMessagesModal={setOpenFavortieMessagesModal}
                          setArrivalMessages={setArrivalMessages}
                        />
                      </div>
                      </>
                    );
                <>           
                </>
                  })}
              </div>

              <div className="chatBoxBottom">
                {isRecording ? (
                  false
                ) : (
                  <>
                    <textarea
                      onChange={(e) => setNewMessage(e.target.value)}
                      value={newMessage}
                      className={`chatMessageInput ${isHiddenMode && hiddenFor.length > 0 && "hidden-mode-textarea"}`}
                      name="messageInput"
                      id="messageInput"
                      placeholder="send message ..."
                      ref={sendMsgref}
                      onKeyDown={handleKeyPressed}
                    ></textarea>

                    <input
                      type="file"
                      ref={fileInputref}
                      onChange={(e) => {
                        if (
                          e.target.files[0] &&
                          e.target.files[0]?.size <=
                          Number(process.env.REACT_APP_MAX_FILE_SIZE)
                        ) {
                          // setFile(e.target.files[0]);
                          uploadFile(e.target.files[0]);
                          setConversationFileUpload(cuurentChat._id);
                        } else {
                          if (
                            e.target.files[0]?.size >
                            Number(process.env.REACT_APP_MAX_FILE_SIZE)
                          ) {
                            toast.error(
                              "Message file shouldn't exceed 15 mb "
                            );
                          } else {
                            toast.error("You must select a file ");
                          }
                        }
                      }}
                      value={file?.fileName}
                      hidden
                      id="fileId"
                    />

                    <button 
                        className="voiceIcon attach-icon"
                        onClick={() => fileInputref.current.click()}
                    >
                      <AttachFileIcon />
                    </button>

                    <button
                      onClick={handleMsgSend}
                      className="sendButton send-msg-icon"
                      disabled={!newMessage || isRecording}
                    >
                      <SendIcon/>
                    </button>

                    {cuurentChat && cuurentChat.isGroup && user.isAdmin && (
                      <>
                        {!isHiddenMode && <button className="hidden-mode-icon" onClick={() => { setIsHiddenMode(true); setOpenHiddenGroupMembersModal(true) }}><LockIcon /> </button>}
                        {isHiddenMode && <button className="hidden-mode-icon" onClick={() => { setIsHiddenMode(false); setHiddenFor([]); toast.info("Hidden mode been disabled", toastOptions) }}>{isHiddenMode && hiddenFor?.length > 0 ? <NoEncryptionGmailerrorredIcon /> : <LockIcon /> }</button>}
                      </>
                    )}
                  </>
                )}

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {isAudioRecorderMounted && (
                    <div
                      ref={audioRecorderRef}
                      onClick={(e) => {
                        if (!isRecording) setIsRecording(true);
                        else {
                          const leftSpace =
                            audioRecorderRef.current.getBoundingClientRect().x;
                          const audioRecorderWidth = Number(
                            window
                              .getComputedStyle(audioRecorderRef.current)
                              .width.replace("px", "")
                          );
                          const saveWidth = 0.13 * audioRecorderWidth;
                          const discardWidth = 0.11 * audioRecorderWidth;
                          if (
                            (leftSpace <= e.clientX &&
                              e.clientX <= saveWidth + leftSpace) ||
                            (leftSpace + audioRecorderWidth - discardWidth <=
                              e.clientX &&
                              e.clientX <= leftSpace + audioRecorderWidth)
                          )
                            setIsRecording(false);
                        }
                      }}
                      className="audioRecorderParent"
                    >
                      <AudioRecorder
                        classes={"audioRecorder "}
                        onRecordingComplete={uploadVoice}
                        audioTrackConstraints={{
                          noiseSuppression: true,
                          echoCancellation: true,
                        }}
                        downloadOnSavePress={false}
                        showVisualizer={true}
                        downloadFileExtension="wav"
                      // recorderControls={recorderControls}
                      />
                    </div>
                  )}

                  {/* {//console.log(recorderControls)} */}
                  {/* {isUploading ? (
                    <CircularProgress />
                  ) : isAudioUploading ? (
                    <CircularProgress />
                  ) : isRecording ? (
                    <MicOffIcon
                      className="voiceStoptIcon"
                      onClick={(e) => {
                        setConversationFileUpload(cuurentChat._id);
                        stopRecording(e);
                      }}
                    />
                  ) : (
                    <KeyboardVoiceIcon
                      className="voiceStartIcon"
                      onClick={() => {
                        startRecording();
                        setIsRecording(true);
                      }}
                    />
                  )} */}
                </div>
                {
                  /* <AttachFileIcon className='voiceIcon' onClick={() => fileInputref.current.click()} /> */
                  // {isAudioUploading ? (
                  //   <CircularProgress />
                  // ) : isUploading ? (
                  //   <CircularProgress />
                  // ) : (
                  //   <AttachFileIcon
                  //     className="voiceIcon"
                  //     onClick={() => fileInputref.current.click()}
                  //   />
                  // )
                }
                {/* {isUploading ? (
                  (<CircularProgress />)(
                    isUploading ? (
                      <CircularProgress />
                    ) : (
                      <FileUploadIcon
                        onClick={() => {
                          uploadFile(file);
                          setIsUploading(true);
                        }}
                        className="voiceIcon"
                      />
                    )
                  )
                ) : (
                  <AttachFileIcon
                    className="voiceIcon"
                    onClick={() => fileInputref.current.click()}
                  />
                )} */}
              </div>
            </>
          ) : (
            <>
              <span className="intro">Open a Conversation to start a chat</span>
            </>
          )}
        </div>
      </div>

      <div className="chatAnnouncement">
        <div className="chatAnnouncementWrapper">

          <div
            className="announcementHeader-container"
          >

            <h3
              className="announcementHeader"
              style={{
                fontSize: "35px",
                fontWeight: "400",
                color: "#016379",
                margin: "0",
                backgroundColor: "#004659 !important",

              }}
            >
              Announcements
            </h3>

            {user.isAdmin && user.isAnnouncing && (

              <div className="announcementsActionBtns">

                <button className="add-announcment" onClick={() => setOpenModal((prev) => !prev)}>
                  <AddCircleIcon>
                    add announcement
                  </AddCircleIcon>
                </button>

                <button onClick={() => fullAnnouncementReport(announcements)} className="download-announcemnts-report">
                  <DownloadForOfflineIcon>
                    announcements report
                  </DownloadForOfflineIcon>
                </button>

              </div>

            )}

          </div>

          {openModal && (
            <AnnouncementModal
              checked={checked}
              setChecked={setChecked}
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              setOpenModal={setOpenModal}
              newAnnouncementAdded={newAnnouncementAdded}
              setNewAnnouncementAdded={setNewAnnouncementAdded}
            />
          )}
          {!user.isAdmin && filterdAnnouncements.length !== 0 && (
            <AnnouncementViewModal
              filterdAnnouncements={filterdAnnouncements}
              announcementDocInitialNum={announcementDocInitialNum}
              announcementDocNumDefault={announcementDocNumDefault}
              announcementDocNum={announcementDocNum}
              setAnnouncementDocNumDefault={setAnnouncementDocNumDefault}
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              newAnnouncementAdded={newAnnouncementAdded}
              setNewAnnouncementAdded={setNewAnnouncementAdded}
              checked={checked}
              setChecked={setChecked}
            />
          )}
          {announcements &&
            announcements
              .map((announcement, index) => {
                //console.log(announcement);
                return (
                  <Announcement
                    key={index}
                    announcements={announcements}
                    setAnnouncements={setAnnouncements}
                    announcement={announcement}
                    openAnnouncementInfo={openAnnouncementInfo}
                    setOpenAnnouncementInfo={setOpenAnnouncementInfo}
                    setOpenedAnnouncementObj={setOpenedAnnouncementObj}
                  />
                );
              })
              .slice(-10)
              .reverse()}
        </div>
      </div>

      {groupNameChanger && (
        <GroupNameChanger
          setGroupNameChanger={setGroupNameChanger}
          conversationId={groupNameChangerConversationId}
          onSubmit={updateGroupSettings}
          selectedGroupName={selectedGroupName}
        />
      )}

      {isAddMembersModalOpen && (
        <CreateGroup
          setConversation={setConversation}
          conversation={conversation}
          setOpenCreateGroupModal={setIsAddMembersModalOpen}
          openCreateGroupModal={openCreateGroupModal}
          addMembersMode={true}
          alreadyExistGroupMembers={existInGroupMembers}
          handleAddMembers={handleAddMembers}
          conversationId={conversationIdToAddMembersForGroup}
        />
      )}

      {openCreateGroupModal && (
        <CreateGroup
          setConversation={setConversation}
          conversation={conversation}
          setOpenCreateGroupModal={setOpenCreateGroupModal}
          openCreateGroupModal={openCreateGroupModal}
        />
      )}

      {openCreateNewChatModal && (
        <CreateChat
          conversation={conversation}
          setOpenCreateNewChatModal={setOpenCreateNewChatModal}
          cuurentChat={cuurentChat}
          setCurrentChat={setCurrentChat}
        />
      )}

      {openGroupInfoModal && (
        <GroupInfoModal
          setOpenGroupInfoModal={setOpenGroupInfoModal}
          groupConversationId={groupInfoId}
          membersGroupInfo={membersGroupInfo}
          usersInGroup={usersInGroup}
          setUsersInGroup={setUsersInGroup}
          cuurentChat={cuurentChat}
          setCurrentChat={setCurrentChat}
        />
      )}

      {openAnnouncementInfo && user.isAdmin && (
        <AnnouncementCheckedMembersInfo
          setOpenAnnouncementInfo={setOpenAnnouncementInfo}
          announcement={openedAnnouncementObj}
        />
      )}

      {cuurentChat && cuurentChat.isGroup && openHiddenGroupMembersModal && isHiddenMode &&
        <HiddenGroupMembers
          setIsHiddenMode={setIsHiddenMode}
          setOpenHiddenGroupMembersModal={setOpenHiddenGroupMembersModal}
          cuurentChat={cuurentChat}
          setHiddenFor={setHiddenFor}
          hiddenFor={hiddenFor}
          setPrevHiddenMode={setPrevHiddenMode}
          prevHiddenMode={prevHiddenMode}
          setPrevMsg={setPrevMsg}
          prevMsg={prevMsg}
          setMessages={setMessages}
          messages={messages}
        />}

        {showLogoutFromOtherDevicesModal && <LogOutFromOtherDevices/>}



    </div>
  );
};

export default Chat;
