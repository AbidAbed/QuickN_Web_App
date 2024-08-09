import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import "./navbar.scss";
import { useAppContext } from "../../context/appContext";
import PersonIcon from "@mui/icons-material/Person";
import profilePic from "../../assets/images/profile.png";
import { axiosObj } from "../../utils/axios";
import CircularProgress from "@mui/material/CircularProgress";
import logo from "../../assets/images/Artboard.svg";
import { IoMdArrowDropdown } from "react-icons/io";

const Navbar = () => {
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { logoutUser, user, setSelectedSearchedMessage, token } =
    useAppContext();

  const [searchTerm, setSearchTerm] = useState("");

  const [searchData, setSearchData] = useState({ users: [], messages: [] });

  const [messagesPage, setMessagesPage] = useState(1);

  const [userConversationPage, setUserConversationPage] = useState(1);

  const [usersPage, setUsersPage] = useState(1);

  const [isConversations, setIsConversations] = useState(true);

  const [isMessages, setIsMessages] = useState(true);

  const [numberOfUserConversations, setNumberOfUserConversations] =
    useState(null);

  const [isFetching, setIsFetching] = useState();

  const [isLoadingPages, setIsLoadingPages] = useState(false);

  const [responseBuffer, setResponseBuffer] = useState({
    users: [],
    messages: [],
    numberOfUserConversations: -1,
  });

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const closeDropDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    if (!isDropdownOpen) return;
    else {
      window.addEventListener("click", closeDropDown);

      return () => {
        window.removeEventListener("click", closeDropDown);
      };
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const closeDropDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm("");
      }
    };

    if (searchTerm !== "") {
      window.addEventListener("click", closeDropDown);

      return () => {
        window.removeEventListener("click", closeDropDown);
      };
    } else {
      return;
    }
  }, [searchTerm]);

  const scrollContainerRef = useRef(null);

  useEffect(() => {}, [user]);

  const navigate = useNavigate();

  const logout = () => {
    logoutUser();
    navigate("/sign-in");
  };

  function handleSearchChange(e) {
    e.preventDefault();
    setSearchTerm(e.target.value);
    setSearchData({ users: [], messages: [] });
  }

  const handleOnScroll = () => {
    const scrollContainer = scrollContainerRef.current;

    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Check if the user has reached the end (within a threshold)
      // Adjust the threshold as needed

      if (scrollTop + clientHeight === scrollHeight) {
        setIsLoadingPages(true);
        if (userConversationPage <= responseBuffer.numberOfUserConversations)
          scrollContainerRef.current.scrollTop = 190;
      }
    }
  };

  useEffect(() => {
    if (isFetching) setSearchData({ users: [], messages: [] });
  }, [isFetching]);

  useEffect(() => {
    if (
      responseBuffer.numberOfUserConversations > 0 &&
      userConversationPage <= responseBuffer.numberOfUserConversations &&
      searchData.messages.length + searchData.users.length <= 6
    ) {
      setIsLoadingPages(true);
    }
  }, [responseBuffer]);

  useEffect(() => {
    if (isFetching) {
      setUsersPage(1);
      setMessagesPage(1);
      setUserConversationPage(1);
      if (usersPage === 1 && messagesPage === 1 && userConversationPage === 1)
        handleSearch();
      setIsFetching(false);
    } else if (isLoadingPages) {
      if (
        responseBuffer.users.length === 0 &&
        responseBuffer.messages.length === 0 &&
        userConversationPage <= responseBuffer.numberOfUserConversations &&
        responseBuffer.numberOfUserConversations !== 0
      ) {
        setUserConversationPage(userConversationPage + 1);
        setUsersPage(1);
        setMessagesPage(1);
      } else {
        if (isMessages && responseBuffer.messages.length !== 0)
          setMessagesPage(messagesPage + 1);
        if (isConversations && responseBuffer.users.length !== 0)
          setUsersPage(usersPage + 1);
      }
    }
  }, [isFetching, isLoadingPages]);

  useEffect(() => {
    if (searchTerm !== "") handleSearch();
  }, [usersPage, messagesPage, userConversationPage]);

  // //console.log(searchData);

  async function handleSearch(e) {

    if (e) e.preventDefault();
    
    try {
      const response = await axiosObj.get(
        `/message/users/search?searchterm=${searchTerm}&messagesPage=${messagesPage}&user_id=${user._id}&conversationPage=${userConversationPage}&usersPage=${usersPage}`,
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );


      setResponseBuffer({
        users: [...response.data.users],
        messages: [...response.data.messages],
        numberOfUserConversations: response.data.numberOfUserConversations,
      });

      setSearchData({
        users: [...searchData.users, ...response.data.users],
        messages: [...searchData.messages, ...response.data.messages], // Corrected this line
      });

      setIsLoadingPages(false);

    } catch (error) {
      // //console.log(error);
    }
  }

  const [avatarSrc, setAvatarSrc] = useState(profilePic);

  const checkAvatarExists = async (avatarUrl) => {
    try {
      const response = await axiosObj.head(avatarUrl);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const loadAvatar = async (user, setAvatarSrc) => {
    if (user?.avatar) {
      const exists = await checkAvatarExists(user?.avatar);
      if (exists) {
        setAvatarSrc(user?.avatar);
      } else {
        setAvatarSrc(profilePic);
      }
    }
  };

  useEffect(() => {
    loadAvatar(user, setAvatarSrc);
  }, [user]);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/">
          <img className="navbar__logo" src={logo} />
        </Link>

        {useLocation().pathname !== "/profile" ? (
          <form
            ref={searchRef}
            className="navbar__search-form"
            onSubmit={(e) => {
              e.preventDefault();
              setIsFetching(true);
            }}
          >
            <div style={{ width: "2%", marginLeft: "2%" }}>
              <SearchIcon
                style={{ width: "100% !important" }}
                className="search-icon"
                onClick={(e) => {
                  e.preventDefault();
                  setIsFetching(true);
                }}
              />
            </div>
            <div style={{ width: "50%" }}>
              <input
                style={{ width: "100% !important" }}
                className="search-input"
                type="text"
                onChange={handleSearchChange}
                value={searchTerm}
                ref={searchRef}
              />
            </div>
            <div style={{ width: "7%", marginLeft: "2%" }}>
              <button
                style={{ width: "100% !important" }}
                className={isConversations ? "searchButton" : "nonActive"}
                onClick={(e) => {
                  e.preventDefault();
                  setIsConversations(!isConversations);
                }}
              >
                Contacts
              </button>
            </div>
            <div style={{ width: "7%", marginLeft: "2%" }}>
              <button
                style={{ width: "100% !important" }}
                className={isMessages ? "searchButton" : "nonActive"}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMessages(!isMessages);
                }}
              >
                Messages
              </button>
            </div>
            {console.log(searchData)}
            {searchTerm !== "" && Object.keys(searchData).length !== 0 ? (
              Object.keys(searchData).length !== 0 ? (
                <div className="button-container">
                  {!isLoadingData &&
                    (searchData?.users?.length !== 0 ||
                      searchData?.messages?.length !== 0) && (
                      //  <div className="pareantDrompdawon">
                      <div
                        className={`dropdown`}
                        onScroll={handleOnScroll}
                        ref={scrollContainerRef}
                      >
                        {!isLoadingData &&
                        searchData.users?.length !== 0 &&
                        isConversations
                          ? searchData.users.map((usr) => (
                            !usr.groupName && !usr?.groupName &&
                              <div
                                className={`${
                                  searchData?.users?.length === 1
                                    ? "one-search"
                                    : "dropdown-item"
                                }`}
                                key={usr.id}
                                onClick={(e) => {
                                  e.preventDefault();

                                  // if(usr?.groupName !== null)
                                  setSelectedSearchedMessage({
                                    conversationId: usr.conversationId,
                                    isGroup: false,
                                    isMessage: false,
                                    members: usr.members,
                                    isGroupMemberSelected:
                                      usr?.groupName !== null ? true : false,
                                  });
                                  setSearchTerm("");
                                }}
                              >
                                <div className="search-all-info">
                                  {/* <span className="search-user-name">
                                    {usr.username}
                                  </span> */}
                                  {!usr.groupName && !usr?.groupName && (
                                    <span className="search-user-name">
                                    {usr.username}
                                  </span>
                                    // <span>
                                    //   {usr?.groupName !== null &&
                                    //     `in "${usr?.groupName}" group`}
                                    // </span>
                                  )}
                                </div>
                              </div>
                            ))
                          : false}
                        {searchData.messages.length !== 0 &&
                        isMessages &&
                        !isLoadingData
                          ? searchData.messages.map((msg, index) => (
                              <div
                                className={`${
                                  searchData.messages.length === 1
                                    ? "one-search"
                                    : "dropdown-item"
                                }`}
                                key={index}
                              >
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedSearchedMessage({
                                      conversationId: msg.conversation_Id,
                                      messageId: msg.message_id,
                                      isMessage: true,
                                      isGroup: msg.isGroup,
                                      members: msg.members,
                                    });
                                    setSearchTerm("");
                                  }}
                                >
                                  {console.log(searchData, "1")}
                                  <span className="sender-username">
                                    {msg.sender_username}
                                  </span>
                                  {" : "}
                                  {msg.text} {msg.messageCreatedAt}
                                  {msg.isGroup ? (
                                    <p className="sender-username">
                                      {msg.groupName}
                                    </p>
                                  ) : (
                                    false
                                  )}
                                </div>
                              </div>
                            ))
                          : false}

                        {isLoadingData ? <CircularProgress /> : false}
                      </div>
                      //  </div>
                    )}
                </div>
              ) : (
                <div>No data were found</div>
              )
            ) : (
              <></>
            )}
            <div style={{ width: "7%", marginLeft: "1%" }}>
              <button className="searchButton">Search</button>
            </div>
          </form>
        ) : (
          false
        )}

        {/* <ul className="icons__list">
          <Link>
            <li className="icon--item">
              <PersonAddIcon className="icon" />
              <span>2</span>
            </li>
          </Link>

          <Link>
            <li className="icon--item">
              <ChatIcon className="icon" />
              <span>7</span>
            </li>
          </Link>

          <Link>
            <li className="icon--item">
              <NotificationsIcon className="icon" />
              <span>5</span>
            </li>
          </Link>
        </ul> */}

        <div className="dropdownParent">
          <div>
            <img
              onClick={() => navigate("/profile")}
              className="navabr__img_container"
              style={{ cursor: "pointer" }}
              src={avatarSrc}
            />
          </div>
          <div className="profileClass">
            <div>
              <div className="online" />
              {user?.username}
            </div>
            <div>
              <button
                ref={dropdownRef}
                className="dropdownButton"
                onClick={toggleDropdown}
              >
                {<IoMdArrowDropdown />}
              </button>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-content">
                <button
                  className="drop-down-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="drop-down-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>{" "}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;