import "./profile.scss";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/appContext";
import { axiosObj } from "../../utils/axios";
import { toast } from "react-toastify";
import profilePic from "../../assets/images/profile.png";
import { useNavigate } from "react-router-dom";


const checkAvatarExists = async (avatarUrl) => {
  try {
    const response = await axiosObj.head(avatarUrl);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};



const loadAvatar = async (defaultUser, setAvatarSrc) => {
  if (defaultUser?.avatar) {
    const exists = await checkAvatarExists(defaultUser?.avatar);
    if (exists) {
      setAvatarSrc(defaultUser?.avatar);
    } else {
      setAvatarSrc(profilePic);
    }
  }
};

const Profile = () => {
  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  const { user, loading, error, token, setUpLocalstorage } = useAppContext();

  const [file, setFile] = useState(undefined);
  const [formData, setFormData] = useState({});
  const [defaultUser, setDefaultUser] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const [avatarSrc, setAvatarSrc] = useState(profilePic);

  const navigate = useNavigate();
  const fileRef = useRef(null);

  useEffect(() => {
    loadAvatar(defaultUser, setAvatarSrc);
  }, [defaultUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (user.username === e.target.value || user.email === e.target.value)
      setIsButtonDisabled(true);
    else setIsButtonDisabled(false);
  };

  const getUser = async () => {
    try {
      const response = await axiosObj.get(
        `/auth/getUser/${user._id}`,
        {},
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );
      setDefaultUser(response.data);
    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    getUser();
  }, [user]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const response = await axiosObj.post(
        `/auth/updateUserProfile/${user._id}`,
        formData,
        {
          headers: {
            token_header: `Bearer ${token}`,
          },
        }
      );

      setDefaultUser(response.data);

      setUpLocalstorage({ user: response.data, token: token });

      toast.success("Profile updated successfully", toastOptions);

      setIsButtonDisabled(true);
    } catch (error) {
      //console.log(error.response.data.msg);
      toast.error(error.response.data.msg);
    }
  };

  const handleFileUpload = async (e, file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      return toast.error("Unsupported file type", toastOptions);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosObj.post(
        `/message/upload/profilePic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token_header: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const progress = Math.round((loaded * 100) / total);
            setFilePerc(progress);
          },
        }
      );

      setUpLocalstorage({
        user: {
          ...user,
          avatar: `http://localhost:5000/api/v1/message/file/binary?fileId=${
            response.data._id
          }&page=${1}`,
        },
        token: token,
      });

      setFormData({
        ...formData,
        avatar: `http://localhost:5000/api/v1/message/file/binary?fileId=${
          response.data._id
        }&page=${1}`,
      });
    } catch (error) {
      setFileUploadError(error.response);
    }
  };

  useEffect(() => {
    if (formData.avatar) handleSubmit();
  }, [formData.avatar]);

  return (
    <div className="profile">
      <h1>Profile</h1>

      <form onSubmit={handleSubmit} className="form">
        {/* // assign the ref value to the input onChange={handleChange} onChange={handleChange} field (we catch the input onChange={handleChange} onChange={handleChange} field inside this ref) */}
        <input
          onChange={(e) => {
            handleFileUpload(e, e.target.files[0]);
            // setFile(e.target.files[0]);
          }}
          type="file"
          ref={fileRef}
          hidden
          accept=".png, .jpg, .jpeg"
        />

        {/* // every time we click on the image at will act as we click on the input onChange={handleChange} onChange={handleChange} field , because the ref.current object contain the input onChange={handleChange} onChange={handleChange} field */}
        <img
          onClick={() => fileRef.current.click()}
          src={avatarSrc}
          className="profile-img"
          alt=""
        />

        <p className="upload-text">
          {fileUploadError ? (
            <span className="upload-error">Erron while upload image</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="upload-perc">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="upload-success">Image Successfully uploaded</span>
          ) : (
            ""
          )}
        </p>

        <input
          onChange={handleChange}
          defaultValue={defaultUser?.username}
          type="text"
          className="form-input"
          name="username"
          placeholder="username"
        />
        <input
          onChange={handleChange}
          defaultValue={defaultUser?.email}
          type="email"
          className="form-input"
          name="email"
          placeholder="name@example.com"
        />
        <input
          onChange={handleChange}
          type="password"
          className="form-input"
          name="password"
          placeholder="new password"
        />

        <button
          disabled={isButtonDisabled || loading}
          className="update-profile-btn"
        >
          {loading ? "Loading..." : "update profile"}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="cancle-update-profile-btn"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default Profile;
