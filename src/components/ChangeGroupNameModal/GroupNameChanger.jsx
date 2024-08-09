// GroupNameChanger.js

import React, { useEffect, useState } from "react";
import "./GroupNameChanger.css";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";
import CloseIcon from "@mui/icons-material/Close";


const GroupNameChanger = ({
  isOpen,
  onSubmit,
  conversationId,
  setGroupNameChanger,
  selectedGroupName,
}) => {

  const [groupName, setGroupName] = useState("");

  const { token } = useAppContext();

  const [group, setGroup] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleGroupNameChange = (e) => {
    e.preventDefault();
    setGroupName(e.target.value);
  };

  useEffect(() => {
    const getGroupData = async () => {
      try {
        // Fetch group details using the conversation ID or group ID
        const response = await axiosObj.get(
          `/group/getGroup/${conversationId}`,
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
  }, []);


  const onClose = (e) => {
    setGroupNameChanger((prev) => !prev);
  };

  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    // console.log(file);
    if (
      file?.type.split("/")[1] === "png" ||
      file?.type.split("/")[1] === "jpg" ||
      file?.type.split("/")[1] === "jpeg"
    )
      setSelectedImage(file);
    else setValidationError("Only accepts images");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedImage && !groupName) {
      setValidationError("You must pick an avatar or change the group name");
      return;
    } else setValidationError(null);
    onSubmit(e, {
      conversationId,
      groupName: groupName.trim(),
      avatar: selectedImage,
    });
    onClose(); // Close the modal after submission
  };

  // console.log(selectedGroupName);
  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onClick={(e) => onClose(e)}
    >

      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <button className="close-btn extra-three" onClick={(e) => onClose(e)}>
          <CloseIcon/>
        </button>

        <div className="groupName group-changer-name">{selectedGroupName}</div>

        <form onSubmit={(e) => handleSubmit(e)}>

          <input
            type="text"
            placeholder="Enter text"
            className="modal-input"
            value={groupName}
            onChange={handleGroupNameChange}
          />

          <input
            className="groupImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <button type="submit" className="submit-btn">
            Submit
          </button>

          {validationError && <p className="errorText">{validationError}</p>}

        </form>

      </div>

    </div>

  );
};

export default GroupNameChanger;
