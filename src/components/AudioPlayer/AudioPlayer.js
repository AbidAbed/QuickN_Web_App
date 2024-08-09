import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
// import "./AudioPlayer.css";
const AudioPlayer = ({ src, className }) => {
  const [howl, setHowl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barLoadingComponent, setLoadingBarComponent] = useState();
  const parentDiv = useRef(null);
  const barDiv = useRef(null);
  const buttonRef = useRef(null);
  const [isTimeChangedByUser, setIsTimeChangedByUser] = useState(false);
  useEffect(() => {
    const newHowl = new Howl({
      src: [src],
      format: ["wav"],
      onplay: () => {
        setIsPlaying(true);
        // console.log(1);
      },
      onpause: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
      },
      onseek: () => setCurrentTime(howl?.seek() || 0),
      onload: () => setDuration(howl?.duration() || 0),
    });

    setHowl(newHowl);

    return () => {
      if (newHowl) {
        newHowl.unload();
      }
    };
  }, [src]);

  useEffect(() => {
    let animationFrameId;
    setDuration(howl?.duration() || 0);
    const updateProgress = () => {
      if (howl) {
        setCurrentTime(howl.seek());
        animationFrameId = requestAnimationFrame(updateProgress);
        setLoadingBarComponent(
          <div
            ref={barDiv}
            style={{
              width: `${(howl.seek() / duration) * 100}%`,
              height: "100%",
              backgroundColor: "#529792",
              position: "absolute",
            }}
          />
        );
        setIsTimeChangedByUser(false);
      }
    };

    if (isPlaying || isTimeChangedByUser) {
      updateProgress();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [howl, isPlaying, duration, currentTime, isTimeChangedByUser]);

  const handlePlayPause = () => {
    if (howl) {
      if (isPlaying) {
        howl.pause();
      } else {
        howl.play();
      }
    }
  };

  const handleSeek = (event) => {
    if (howl) {
      setIsTimeChangedByUser(true);
      const seekPercentage =
        (event.clientX - parentDiv.current.getBoundingClientRect().x) /
        Number(
          window.getComputedStyle(parentDiv.current).width.replace("px", "")
        );

      const seekTime = seekPercentage * (howl?.duration() || 0);
      howl.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className={className}
      //style={{ display: "flex", alignItems: "center" }}
    >
      <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      <div
        onClick={handleSeek}
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "#ccc",
          margin: "0 10px",
          position: "relative",
          cursor: "pointer",
        }}
        ref={parentDiv}
      >
        {barLoadingComponent}
      </div>
      <div>{formatTime(howl?.seek() || 0)}</div>
    </div>
  );
};

export default AudioPlayer;
