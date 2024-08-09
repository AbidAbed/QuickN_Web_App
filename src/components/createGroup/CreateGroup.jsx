import React, { useEffect, useState, useRef } from "react";
// import "./createGroup.scss";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import socket from "../../socketConfig";
import SearchIcon from "@mui/icons-material/Search";
import image from "../../assets/images/ArtboardSmallBackground.svg";
const CreateGroup = ({
  setOpenCreateGroupModal,
  openCreateGroupModal,
  setConversation,
  conversation,
  addMembersMode,
  nameOfGroup,
  alreadyExistGroupMembers,
  handleAddMembers,
  conversationId,
}) => {
  const { user, token } = useAppContext();

  const [users, setUsers] = useState([]);

  const [groupName, setGroupName] = useState("");

  const [addedGroupMembers, setAddedGroupMembers] = useState([]);

  const [newGroup, setNewGroup] = useState(null);

  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };


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
  }, [searchTerm, users]);



  const getUsers = async () => {
    try {
      // const response = await axiosObj.get(`/auth/getAllUsers`, {
      //   headers: {
      //     token_header: `Bearer ${token}`,
      //   },
      // });

      const response = await axiosObj.get(`/auth/get-contact-list`, {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });

      setUsers(response.data)
      
    } catch (error) {
      //console.log(error);
    }
  };


  useEffect(() => {
    getUsers();
  }, []);


  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName || !addedGroupMembers)
      return toast.error("empty group fields", toastOptions);

    if(groupName.length > 25) return toast.error("group name must be less than 25 character" , toastOptions)

    try {
      const response = await axiosObj.post(
        `/group/createGroup/${user._id}`,
        {
          groupName,
          addedGroupMembers,
        },
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );
      // //console.log(user._id);

      toast.success("Group created successfully", toastOptions);

      addedGroupMembers.map((member) => {
        socket.emit("startConversation", {
          senderId: user._id,
          receiverId: member,
          convId: response.data.conversation._id,
        });
      });

      setNewGroup(response.data.newGroup);

      setOpenCreateGroupModal((prev) => !prev);
    } catch (error) {
      toast.error(error.response.data.msg, toastOptions);
    }
  };


  const addGroupMember = async (e, singleUser) => {
    e.preventDefault();
    setAddedGroupMembers([singleUser._id, ...addedGroupMembers]);
  };


  const removeGroupMember = (e, singleUser) => {
    e.preventDefault();
    setAddedGroupMembers(
      addedGroupMembers.filter((id) => id !== singleUser._id)
    );
  };



  return (
    <div className="createGroup">

      <div className="createGroupContiner createGroupContiner-custom">

        <div className="createGroupHeader createGroupHeader-custom">
          
          <h3 className="createGroupHeaderTag">
            {addMembersMode ? "Add new members" : "Create New Group"}
          </h3>

          <button className="cancelCreateGroupbtn cancelCreateGroupbtn-custom">
            <CloseIcon
              onClick={() => setOpenCreateGroupModal((prev) => !prev)}
              className="icon"
            />
          </button>

        </div>

        <div className="createGroupinputsForm">

          <div className="createGroupform">

            <div className="createGroupformItem">
              {addMembersMode ? (
                false
              ) : (
                <>
                  <label className="label" htmlFor="groupName">
                    Group Name
                  </label>
                  <input
                    onChange={(e) => setGroupName(e.target.value)}
                    className="createGroupInputSpecific"
                    name="groupName"
                    type="text"
                    id="groupName"
                    placeholder="name example"
                  />
                </>
              )}
            </div>

            <div className="createGroupformItem">
              <label className="label" htmlFor="groupMembers">
                {addMembersMode ? "Users" : "Group Members"}
              </label>

              <div
                className="navbar__search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div style={{ position: "relative" }}>
                  {/* <SearchIcon
                    className="searchIcon"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  /> */}
                  <input
                    className="createGroupInput"
                    type="text"
                    onChange={handleSearchContacts}
                    value={searchTerm}
                  />
                  <button className="searchBtn">Search</button>
                </div>
              </div>
              <div>
                <div className="membersCheckboxContainer">
                  {users !== null
                    ? (searchTerm !== "" ? searchedUsers : users)
                        .filter((usr) => {
                          const foundUsr = alreadyExistGroupMembers?.find(
                            (usr) => usr === usr._id
                          );
                          if (foundUsr) return false;
                          else return true;
                        })
                        .sort((a , b) => {
                          if(a.username > b.username){
                            return 1
                          }
                          
                          if(a.username < b.username){
                            return -1
                          }

                          return 0
                        })
                        .map((singleUser, index) => {
                          return (
                            <div
                              key={singleUser._id}
                              className={`membersCheckboxContainerItem ${
                                addedGroupMembers.includes(singleUser._id) &&
                                "user-added"
                              }`}
                            >
                              <span className="groupMemberName" htmlFor="">
                                {singleUser.username}
                              </span>
                              <button
                                onClick={(e) => addGroupMember(e, singleUser)}
                                className="groupMemberAddNameBtn groupMemberAddNameBtn-custom"
                              >
                                add user
                              </button>
                              {addedGroupMembers.includes(singleUser._id) && (
                                <button
                                  onClick={(e) =>
                                    removeGroupMember(e, singleUser)
                                  }
                                  className="groupMemberAddNameBtn groupMemberAddNameBtn-custom"
                                >
                                  remove user
                                </button>
                              )}
                            </div>
                          );
                        })
                    : false}
                </div>
              </div>
            </div>

            <hr className="hr-tag" />
          </div>

          <div className="createGroupformButtons">
           
            {addMembersMode ? (
              <button
                type="submit"
                onClick={(e) => {
                  handleAddMembers(e, addedGroupMembers, conversationId);
                  setOpenCreateGroupModal((prev) => !prev);
                }}
                className="createGroupSubmitBtn"
              >
                Add Members
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleCreateGroup}
                className="createGroupSubmitBtn"
              >
                Create group
              </button>
            )}
             <button
              onClick={() => setOpenCreateGroupModal((prev) => !prev)}
              className="createGroupSubmitBtn createGroupSubmitBtn-custom"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateGroup;
