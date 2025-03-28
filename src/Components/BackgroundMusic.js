import { useEffect, useState } from "react";

const BackgroundMusic = () => {
  const [audio] = useState(new Audio("/Audio/BackgroundMusic.mp3"));
  const [volume, setVolume] = useState(0.25); 
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audio.loop = true;
    audio.play().catch((error) => console.log("Autoplay failed:", error));

    // Set initial volume when audio is ready
    audio.volume = volume;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useEffect(() => {
    if (isMuted) {
      audio.volume = 0; // Mute the audio
    } else {
      audio.volume = volume; // Restore the volume
    }
  }, [isMuted, volume, audio]);

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    setIsMuted(false); // Unmute when the user changes the volume manually
  };

  const toggleMute = () => {
    setIsMuted((prevState) => !prevState); // Toggle mute state
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        padding: "5px", // Reduced padding for a cleaner look
      }}
    >
      <label
        onClick={toggleMute}
        style={{
          fontSize: "25px",
          marginRight: "8px",
          cursor: "pointer",
          verticalAlign: "middle", // Aligns icon properly
        }}
      >
        {isMuted || volume === 0 ? "🔇" : "🔊"} {/* Show mute icon when muted or volume is 0 */}
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume} // If muted, set the slider to 0
        onChange={handleVolumeChange}
        style={{
          cursor: "pointer",
          width: "100px", // You can adjust the width if needed
          height: "10px", // Adjust height for the slider
        }}
      />
    </div>
  );
};

export default BackgroundMusic;
