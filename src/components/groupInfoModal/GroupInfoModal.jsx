import React, { useEffect, useState } from "react";
import "./groupInfoModal.css";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import svgMesh from "../../assets/images/ArtboardSmallBackground.svg";
import { useAppContext } from "../../context/appContext";
import { IoCloudyNight } from "react-icons/io5";
import { axiosObj } from "../../utils/axios";
import { toast } from "react-toastify";
import socket from "../../socketConfig";
import groupPic from "../../assets/images/groupPic.jpg";

const checkAvatarExists = async (groupAvatar) => {
  try {
    const response = await axiosObj.head(
      `/message/file/binary?fileId=${groupAvatar}&page=1`
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const loadAvatar = async (group, setAvatarSrc) => {
  if (group?.avatar) {
    const exists = await checkAvatarExists(group?.avatar, setAvatarSrc);
    if (exists) {
      setAvatarSrc(
        `http://localhost:5000/api/v1/message/file/binary?fileId=${group?.avatar}&page=1`
      );
    } else {
      setAvatarSrc(groupPic);
    }
  }
};

const GroupInfoModal = ({
  setOpenGroupInfoModal,
  groupConversationId,
  membersGroupInfo,
  usersInGroup,
  setUsersInGroup,
  cuurentChat,
  setCurrentChat
}) => {


  const { conversationNames, token, user } = useAppContext();

  const [groupUsers, setGroupUsers] = useState([]);
  const [group, setGroup] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(groupPic);
  const [groupName , setGroupName] = useState("")

  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const [groupConvImg, setGroupConvImg] = useState(null);

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
    }else{
      setGroupConvImg(groupPic);
    }
  };


  useEffect(() => {
    setGroupName(conversationNames[groupConversationId]?.name)
  } , [])



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

        } catch (error) {
          //console.log(error);
        }
      };

      getGroupConverImg();
    }
  }, [cuurentChat]);



  useEffect(() => {
    socket.on("removedFromGroup", ({ senderId, convId, removedUserId }) => {
      if (removedUserId === user._id) {
        setOpenGroupInfoModal(false);
      } else {
        const updatedUsers = usersInGroup.filter(
          (gMem) => gMem._id !== removedUserId
        );
        setUsersInGroup([...updatedUsers]);
      }
    });
  }, []);



  useEffect(() => {
    const getGroupData = async () => {
      try {
        // Fetch group details using the conversation ID or group ID
        const response = await axiosObj.get(
          `/group/getGroup/${groupConversationId._id}`,
          {
            headers: {
              token_header: `Bearer ${token}`,
            },
          }
        );

        setGroup(response.data); // Assuming this fetches group details
      } catch (error) {
        console.error(error);
      }
    };

    getGroupData();
  }, [groupConversationId]);



  useEffect(() => {
    if (group) {
      loadAvatar(group, setAvatarSrc);
    }
  }, [group]);



  const getUser = async (friend) => {
    try {
      const response = await axiosObj.get(
        `/auth/getUser/${friend}`,
        {},
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      return response.data;
      // setGroupUsers(response.data);
    } catch (error) {
      // //////console.log(error);
    }
  };


  useEffect(() => {

    const setUsers = async () => {
      setGroupUsers(
        await Promise.all(
          usersInGroup.map((groupMem) => {
            return getUser(groupMem._id);
          })
        )
      );
    };

    setUsers();

  }, []);


  const removeUserFromGroup = async (userId) => {
    try {
      const response = await axiosObj.delete(`/group/user`, {
        data: { conversationId: groupConversationId._id, userId: userId },
        headers: {
          admin_header: `admin ${token}`,
        },
      });


      const updatedUsers = usersInGroup.filter((gMem) => gMem._id !== userId);
      setUsersInGroup([...updatedUsers]);
      // setGroupUsers(response.data);

      usersInGroup.map((groupUser) => {
        if(groupUser._id !== user._id){
          socket.emit("removedFromGroup", {
            senderId: user._id,
            receiverId: groupUser?._id ,
            convId: groupConversationId._id,
            removedUserId: userId,
          });
        }
      })


      if(userId === user._id){
        usersInGroup.map((groupUser) => {
          socket.emit("removedFromGroup", {
            senderId: user._id,
            receiverId: groupUser?._id ,
            convId: groupConversationId._id,
            removedUserId: user._id,
          });
        })
      }

      toast.success("User removed successfully", toastOptions);
    
    } catch (error) {
      toast.error("Could not remove user", toastOptions);
    }
  };


  useEffect(() => {
    socket.on("removedFromGroup", ({ senderId, convId, removedUserId }) => {
      if (removedUserId === user._id) {
        setOpenGroupInfoModal(false);
      } else {
        const updatedUsers = groupUsers.filter(
          (gMem) => gMem._id !== removedUserId
        );

        setGroupUsers([...updatedUsers]);
        
      }
    });

    socket.on(
      "addedToGroup",
      async ({ senderId, convId, addedUsersMembersIds }) => {
        if (addedUsersMembersIds?.length === 0) return;
        const addedUsers = await Promise.all(
          addedUsersMembersIds.map((addedMemberId) => getUser(addedMemberId))
        );

        // setGroupUsers([...groupUsers, ...addedUsers]);

        setUsersInGroup([...groupUsers, ...addedUsers]);

      }
    );

  }, [groupUsers]);



  return (
    <div className="GroupInfoModal-overlay GroupInfoModal-extra">

      <div className="overlay-modal extra">

        <div className="overlay-modal-header extra-two">
          {/* <h3 className='overlay-modal-header-title'>Group info</h3> */}

          <div className="overlay-modal-info">

          <div style={{ display: "flex", alignItems: "center", gap: "4.5vw" , padding : "10px"}}>

              <div className="msg-image-container">
                <img className="groupImg" src={groupConvImg} />
              </div>

              <h5 className="overlay-modal-info-header update">
                Group Name : {conversationNames[cuurentChat?._id]?.name}
              </h5>

              <button
                className="close-button"
                onClick={() => setOpenGroupInfoModal((prev) => !prev)}
              >
                <CloseIcon />

              </button>
          
          </div>
        
          </div>
          
        </div>


        <div className="overlay-modal-info-second">

          <h5 className="overlay-modal-info-header-second">Group Members</h5>

          {usersInGroup && (
            <div className="overlay-modal-info-groupMembers overlay-modal-info-groupMembers-custom">
              {usersInGroup &&
                usersInGroup.map((groupUser) => {
                  return (
                    <div
                      key={groupUser._id}
                      className="overlay-modal-info-groupMembers-item"
                    >
                      <span className="overlay-modal-info-groupMembers-item-memberName">
                        {groupUser.username}
                      </span>
                      {user.isAdmin && (
                        <LogoutIcon
                          onClick={() => removeUserFromGroup(groupUser._id)}
                          className="removeGroupMemberIcon"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          )}


        </div>

      </div>

    </div>
  );
};

export default GroupInfoModal;
