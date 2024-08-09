import React, { useEffect, useState } from "react";
// import "./announcementViewModal.css";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";
import image from "../../assets/images/ArtboardSmallBackground.svg";
import socket from "../../socketConfig";

const AnnouncementViewModal = ({
  announcementDocNumDefault,
  announcementDocInitialNum,
  newAnnouncementAdded,
  setNewAnnouncementAdded,
  announcements,
  setAnnouncements,
  checked,
  setChecked,
  setAnnouncementDocNumDefault,
  announcementDocNum,
  filterdAnnouncements,
}) => {

  const { user, token } = useAppContext();

  const [lastAnnouncements, setLastAnnouncements] = useState([]);

  const [seeMore, setSeeMore] = useState(false);

  useEffect(() => {
    setLastAnnouncements(filterdAnnouncements && filterdAnnouncements);
  }, [filterdAnnouncements]);

  const checkAnnouncement = async (announ) => {
    try {
      // console.log(token);
      const response = await axiosObj.put(
        `/announcement/userChecked/${user?._id}/${announ?._id}`,
        {},
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      response.data.checkedUsers.map((checkedUser) => {
        if (checkedUser.userId === user._id)
          socket.emit("announcementSign", {
            userId: user._id,
            userName: user.username,
            signTime: checkedUser.checkedAt,
            announcementId: response.data._id,
            checkedUserObjectId: checkedUser._id,
          });
      });

      setChecked((prev) => !prev);
      
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <div className="AnnouncementViewModal">
      <h3 className="AnnouncementViewModalHeader">Latest Announcement</h3>

      {lastAnnouncements &&
        lastAnnouncements
          .map((announ) => {
            return (
              <div className="AnnouncementViewModalContainer">
                <div className="AnnouncementViewModalContent">
                  <h5>{announ?.announcementTitle}</h5>
                  <p className={`text ${seeMore ? "full-view" : ""}`}>
                    {announ?.announcementText}
                  </p>
                  <input
                    type="checkbox"
                    id="read-more"
                    class="read-more-checkbox"
                  />
                  <label
                    onClick={() => setSeeMore((prev) => !prev)}
                    for="read-more"
                    class="read-more-label"
                  >
                    {seeMore ? "Show Less" : "See more"}
                  </label>

                  <img className="artImg" src={image} />
                </div>

                <button
                  onClick={() => checkAnnouncement(announ)}
                  className="AnnouncementViewModalBtn"
                >
                  Sign
                </button>
              </div>
            );
          })
          .reverse()}
    </div>
  );
};

export default AnnouncementViewModal;
