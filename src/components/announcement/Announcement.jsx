import React, { useEffect, useRef } from "react";
import "./announcement.css";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { format } from "timeago.js";
import { useAppContext } from "../../context/appContext";

const Announcement = ({
  announcement,
  announcements,
  setAnnouncements,
  checked,
  setChecked,
  setOpenAnnouncementInfo,
  setOpenedAnnouncementObj,
}) => {

  const [visibile, setVisibile] = useState(false);

  const [seeMore, setSeeMore] = useState(false);

  const {user} = useAppContext()

  const seeMoreRefbtn = useRef(null);

  const viewAnnouncementInfo = (e) => {

    
    if (seeMoreRefbtn.current && !seeMoreRefbtn.current.contains(e.target) && user.isAdmin) {
      setOpenAnnouncementInfo(true);
      setOpenedAnnouncementObj(announcement);
    }
  };

  
  return (
    <div onClick={viewAnnouncementInfo} className="announcement">
      <div className="announcementWrapper">
        <div className={`announcementCard ${visibile && "seenCard"}`}>
          <div className="announcementCardContent">
            <h5 className="announcementCardTitle">
              {announcement?.announcementTitle}
            </h5>
            <p className={`announcementCardText ${seeMore ? "fulHeight" : ""}`}>
              {announcement?.announcementText}
            </p>

            <div ref={seeMoreRefbtn}>
              <input
                type="checkbox"
                id="read-more"
                class="read-more-checkbox"
              />
              <label
                for="read-more"
                class="cardDate"
                onClick={() => setSeeMore((prev) => !prev)}
              >
                {seeMore ? "show less" : "see more"}
              </label>
            </div>
          </div>


            <div className="announcement-seen-info">

            <span className="announcementTime">
              {format(announcement?.createdAt)}
            </span>

              {
                user.isAdmin && 
                <>
                  <RemoveRedEyeIcon
                    className="eyeIcon"
                    onClick={() => {
                      setVisibile((prev) => !prev);
                    }}
                  />
    
                  <span className="announcement-viewed-number">{announcement.checkedUsers.length}</span>
                
                </>
              }
              
            </div>

          </div>

          </div>
      </div>
  );
};

export default Announcement;
