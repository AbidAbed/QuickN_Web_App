import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
// import "./announcement.scss";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import socket from "../../socketConfig";
import image from "../../assets/images/ArtboardSmallBackground.svg";
const AnnouncementModal = ({
  setOpenModal,
  announcements,
  setAnnouncements,
  newAnnouncementAdded,
  setNewAnnouncementAdded,
  setChecked,
}) => {
  const toastOptions = {
    position: "top-center",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const { token, newAnnouncementAddedFun } = useAppContext();

  const navigate = useNavigate();

  const [formadata, setFormData] = useState({
    announcementTitle: "",
    announcementText: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formadata, [e.target.name]: e.target.value });
  };

  const addAnnouncement = async (e) => {

    e.preventDefault();

    if(formadata.announcementTitle.length > 30 || formadata.announcementText.length > 100){
      toast.error("invalid announcement credentials" , toastOptions)
      setFormData({announcementTitle : "" , announcementText : ""})
      return
    } 



    try {
      const response = await axiosObj.post(
        "/announcement/addAnnouncement",
        formadata,
        {
          headers: {
            admin_header: `admin ${token}`,
          },
        }
      );

      setAnnouncements([...announcements, response.data]);

      setFormData({ announcementTitle: "", announcementText: "" });

      toast.success("announcement added successfully", toastOptions);

      socket.emit("broadcastAnnouncement");

      setOpenModal((prev) => !prev);
    } catch (error) {
      if (!error.response.data.success) {
        toast.error(`${error.response.data.msg}`, toastOptions);
        setOpenModal((prev) => !prev);
      }
    }
  };

  return (
    <div className="modal-overlay">

      <div className="modalContiner modalContiner-cutsom add-announcement-modalContiner">

        <div className="modalHeader custom-modal-header">

          <h3 className="add-announcement-header">Add New Announcement</h3>

          <button
            className="Modalbtn close-add-announ"
            onClick={() => setOpenModal((prev) => !prev)}
          >
            <CloseIcon className="icon" />
          </button>

        </div>

        <div className="inputsForm">

          <form className="form">

            <div className="formItem">

              {/* <label className="label" htmlFor="announcementTitle">
                Announcement Name
              </label> */}

              <input
                onChange={handleChange}
                className="input announcement-input"
                name="announcementTitle"
                type="text"
                id="announcementTitle"
                placeholder="Subject"
                value={formadata.announcementTitle}
              />

            </div>

            <div className="formItem">

              {/* <label className="label" htmlFor="announcementText">
                Announcement Description
              </label> */}

              <textarea
                onChange={handleChange}
                className="input-textarea"
                name="announcementText"
                type="text"
                id="announcementText announcement-input"
                placeholder="Description ..."
                value={formadata.announcementText}
              />

            </div>

            <hr />

          </form>

          <div className="formButtons add-announcement-btns">

            <button
              type="submit"
              onClick={addAnnouncement}
              className="submitBtn add-Announcement-btn"
            >
              Add
            </button>

            
            <button
              className="submitBtn cancel-add-Announcement-btn"
              onClick={() => setOpenModal((prev) => !prev)}
            >
              Cancel
            </button>

          </div>

        </div>

        {/* <div className={artImgParent}> */}
          {/* <img className="artImg" src={image} /> */}
        {/* </div> */}

      </div>

    </div>
  );
};

export default AnnouncementModal;
