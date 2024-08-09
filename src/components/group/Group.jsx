import React, { useEffect, useState } from "react";
import { axiosObj } from "../../utils/axios";
import groupPic from "../../assets/images/groupPic.jpg";
import "./group.scss";
import { useAppContext } from "../../context/appContext";
import { IoNotifications } from "react-icons/io5";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { green } from "@mui/material/colors";



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

const Group = ({
  conversation,
  currentUser,
  conversations,
  groups,
  className,
  children,
  cuurentChat,
  setGroupMenueIsDisplayed,
  setSelectedGroupId,
  groupMenueIsDisplayed,
  setGroupCreatorId
}) => {

  const [group, setGroup] = useState(null);

  const [avatarSrc, setAvatarSrc] = useState(groupPic);

  const [userGroups, setUserGroups] = useState([]);

  const [classNameState, setClassNameState] = useState("");

  const { user, addConversationName, conversationNames, token } =
    useAppContext();


  useEffect(() => {
    if (conversationNames[conversation._id]?.isUnread)
      setClassNameState(<IoNotifications className="notification-icon" />);
    else setClassNameState(null);
  }, [conversationNames]);


  useEffect(() => {
    const getGroupData = async () => {
      try {
        // Fetch group details using the conversation ID or group ID
        const response = await axiosObj.get(
          `/group/getGroup/${conversation._id}`,
          {
            headers: {
              token_header: `Bearer ${token}`,
            },
          }
        );

        setGroup(response.data); // Assuming this fetches group details

        addConversationName({
          name: response.data.groupName,
          _id: response.data.conversationId,
        });

      } catch (error) {
        console.error(error);
      }
    };

    getGroupData();
    
  }, [groups]);


  useEffect(() => {
    if (cuurentChat?.isGroup) {
      loadAvatar(group, setAvatarSrc);
    }
  }, [cuurentChat]);


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
        setUserGroups(response.data); // Assuming this fetches group details
      } catch (error) {
        console.error(error);
      }
    };

    getGroupsData();
  }, [conversation]);


  
  useEffect(() => {
    setGroupCreatorId(group?.groupCreatorId)
  } , [])



  return (
    <div className={`group ${className} ${cuurentChat !== null ? "opened-chat" : "closed-chat"}`}>
        <div style={{display : "block" , whiteSpace : "nowrap" , maxWidth : "2vw" , marginRight : "0.9vw"}}>

          <img
            className="groupImg"
            src={avatarSrc}
            // src={group?.avatar ? `http://localhost:5000/api/v1/message/file/binary?fileId=${group?.avatar}&page=1` : groupPic}
          />

          <span>{group?.groupName}</span>
        
        </div>


        {conversationNames[conversation._id]?.isUnread ? classNameState : ""}

        {user.isAdmin ? (
              <div
                className="groupMenue"
                     onClick={(e) => {
                      setGroupMenueIsDisplayed(!groupMenueIsDisplayed);
                      setSelectedGroupId(conversation._id);
                    }}
                >
                {
                  <MoreHorizIcon
                      className="more-btn"
                      sx={{ color: green[100], fontSize: 30 }}
                      />
                }
          </div>
        ) : (
          false
        )}

        </div>
  );
};

export default Group;


// Fetch and display member information
// useEffect(() => {
//   const fetchGroupMembers = async () => {
//     try {
//       const memberDetails = await Promise.all(
//         groupMembers.map(async (memberId) => {
//           const response = await axiosObj.get(`/auth/getUser/${memberId}`);
//           return response.data;
//         })
//       );
//       // Use memberDetails to display group members' information
//       console.log('Group Members:', memberDetails);
//     } catch (error) {
//       console.error('Error fetching group members:', error);
//     }
//   };

//   if (groupMembers.length > 0) {
//     fetchGroupMembers();
//   }

// }, [groupMembers]);
