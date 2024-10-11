import React, { useState, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const setupMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone stream accessed:", stream);

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

        recorder.onstart = () => {
          console.log('MediaRecorder started');
          setIsRecording(true);
        };

        recorder.ondataavailable = (event) => {
          console.log("Data available from recorder:", event.data);
          if (event.data.size > 0) {
            const blob = new Blob([event.data], { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            console.log("Generated Blob URL:", url);
            setAudioURL(url);  // Set the audio URL for playback

            if (typeof onRecordingComplete === 'function') {
              onRecordingComplete(blob);  // Pass the blob up to App.js
            } else {
              console.error('onRecordingComplete is not a function');
            }
          } else {
            console.warn('No data was recorded.');
          }
        };

        recorder.onerror = (err) => {
          console.error('MediaRecorder error:', err);
          setError('Recording error occurred. Please try again.');
        };

        recorder.onstop = () => {
          console.log('MediaRecorder stopped');
          setIsRecording(false);
        };

        setMediaRecorder(recorder);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError('Could not access the microphone. Please allow access.');
      }
    };

    setupMediaRecorder();

    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onRecordingComplete]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      mediaRecorder.start();
      console.log('Recording started');
    } else {
      console.warn('MediaRecorder is not inactive, cannot start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      console.log('Recording stopped');
    } else {
      console.warn('MediaRecorder is not in a recording state.');
    }
  };

  return (
    <div>
      {isRecording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Audio player to play the recorded sound */}
      {audioURL && (
        <div>
          <audio controls src={audioURL} />
          {/* Ensure audio doesn't play automatically, user can press play */}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
