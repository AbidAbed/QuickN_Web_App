import React, { useState, useRef } from "react";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const { token } = useAppContext();
  const [voice, setVoice] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const recordedAudioBlob = new Blob(audioChunks.current, {
          type: "audio/wav",
        });
        setAudioBlob(recordedAudioBlob);
        audioChunks.current = [];
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing the microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedAudio = () => {
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);
      audio.controls = true;
      audio.play();
    }
  };

  const uploadFile = async (blob) => {
    blob.name = `blob` + Math.floor(Math.random() * 100);
    blob.path = `public/images/${blob.name}`;

    try {
      //   const formData = new FormData()

      const formData = { name: blob.name, path: blob.path };

      const response = await axiosObj.post(`/message/upload/voice`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token_header: `Bearer ${token}`,
        },
      });

      setVoice(response.data);
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <div>
      <h2>Voice Recorder</h2>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <button onClick={() => uploadFile(audioBlob)} disabled={!audioBlob}>
        send audio
      </button>
      {audioBlob && (
        <audio
          style={{ marginTop: "20px" }}
          controls
          src={URL.createObjectURL(audioBlob)}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;
