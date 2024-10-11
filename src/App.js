import React, { useState, useEffect } from 'react';
import Board from './Components/Board';
import './App.css';
import Modal from 'react-modal';
import AudioRecorder from './Components/AudioRecorder';

// Setting app element for accessibility with React Modal
Modal.setAppElement('#root');

// Function to generate the game board
const generateBoard = () => {
  const board = [];
  for (let i = 1; i <= 100; i++) {
    board.push({ number: i, content: null, special: null });
  }

  const getRandomPositions = (count) => {
    const positions = new Set();
    while (positions.size < count) {
      const pos = Math.floor(Math.random() * 100) + 1;
      // Avoid first and last tile
      if (pos !== 1 && pos !== 100) {
        positions.add(pos);
      }
    }
    return Array.from(positions);
  };

  const snakePositions = getRandomPositions(5);
  const beePositions = getRandomPositions(3);
  const tornadoPositions = getRandomPositions(2);

  snakePositions.forEach((pos) => {
    board[pos - 1].content = 'snake';
    board[pos - 1].special = 'snake';
  });

  beePositions.forEach((pos) => {
    board[pos - 1].content = 'bee';
    board[pos - 1].special = 'bee';
  });

  tornadoPositions.forEach((pos) => {
    board[pos - 1].content = 'tornado';
    board[pos - 1].special = 'tornado';
  });

  return board;
};

const App = () => {
  const [board, setBoard] = useState(generateBoard());
  const [playerPosition, setPlayerPosition] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState('Click "Roll Dice" to start!');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ text: '', check: '' });
  const [microphones, setMicrophones] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Request microphone permissions and fetch available devices
  useEffect(() => {
    const getMicrophonePermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter((device) => device.kind === 'audioinput');
        setMicrophones(audioDevices);
        if (audioDevices.length > 0) {
          setSelectedMic(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setMessage('Microphone access is required for this game. Please check your settings.');
      }
    };

    getMicrophonePermissions();
  }, []);

  const rollDice = () => {
    if (!isPlayerTurn) return;
    const dice = Math.floor(Math.random() * 6) + 1;
    setMessage(`You rolled a ${dice}!`);
    movePlayer(dice);
  };

  const movePlayer = (dice) => {
    let newPos = playerPosition + dice;
    if (newPos > 100) {
        newPos = 100 - (newPos - 100);
    }

    // Ensure the new position is between 1 and 100
    newPos = Math.max(1, Math.min(newPos, 100));

    setPlayerPosition(newPos);

    const tile = board[newPos - 1];
    if (tile) {  // Check if the tile exists
        if (tile.special) {
            handleTile(newPos);
        }
    } else {
        console.error('Tile does not exist:', newPos);
    }
  };

  const handleRecordingComplete = (blob) => {
    console.log("Recording complete, received blob:", blob);
    setRecordedBlob(blob);
  };

  const handleTile = (pos) => {
    const tile = board[pos - 1];
    if (tile.special) {
      setIsPlayerTurn(false);
      setModalMessage({
        text: 'You stepped on a special tile. In order to move:',
        sound: tile.special,
      });
      setModalIsOpen(true);
    }
  };

  const analyzeFrequency = async (audioBlob) => {
    return new Promise((resolve, reject) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = (event) => {
            audioCtx.decodeAudioData(event.target.result, (audioBuffer) => {
                const channelData = audioBuffer.getChannelData(0); // Use the first channel (mono)

                if (channelData.length === 0) {
                    reject('No audio data found');
                    return;
                }

                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Float32Array(bufferLength);

                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                source.start();

                setTimeout(() => {
                    analyser.getFloatFrequencyData(dataArray);

                    let maxAmp = -Infinity;
                    let peakIndex = -1;
                    dataArray.forEach((amp, index) => {
                        if (amp > maxAmp) {
                            maxAmp = amp;
                            peakIndex = index;
                        }
                    });

                    if (peakIndex === -1) {
                        resolve(-1);
                        return;
                    }

                    const nyquist = audioCtx.sampleRate / 2;
                    const frequency = (peakIndex * nyquist) / bufferLength;

                    audioCtx.close();
                    resolve(frequency);
                }, 500);
            }, (error) => {
                console.error('Error decoding audio data:', error);
                reject(error);
            });
        };

        reader.onerror = (error) => {
            console.error('Error reading audio blob:', error);
            reject(error);
        };

        reader.readAsArrayBuffer(audioBlob);
    });
};

const handleConfirmSound = async () => {
  if (!recordedBlob) {
      setModalMessage((prev) => ({ ...prev, check: 'You need to make a sound first!' }));
      return;
  }

  const frequency = await analyzeFrequency(recordedBlob);
  const audioDuration = await getAudioDuration(recordedBlob);

  console.log("Duration: " + audioDuration + "s");
  console.log("Frequency: " + frequency + "Hz");

  const isCorrect = checkSoundMatch(frequency, audioDuration, modalMessage.sound);

  if (isCorrect) {
    let moveTiles = 0;

    if (audioDuration >= 9) {
      moveTiles = 3;
    } else if (audioDuration >= 6) {
      moveTiles = 2;
    } else if (audioDuration >= 3) {
      moveTiles = 1;
    } else {
      setModalMessage((prev) => ({ ...prev, check: 'You need to hold the sound longer! (at least 3 seconds)'}));
      return;
    }

    setMessage(`The sound was correct for ${audioDuration.toFixed(2)} seconds. You will move ${audioDuration.toFixed(2)} tiles.`);

    movePlayer(1);
    setModalIsOpen(false);
    setIsPlayerTurn(true);
  } else {
    setModalMessage((prev) => ({ ...prev, check: "Failed! That's not the right sound. Try again!" }));
  }
};
  
  // Function to get audio duration
  const getAudioDuration = (audioBlob) => {
    return new Promise((resolve, reject) => {
        const audioElement = new Audio(URL.createObjectURL(audioBlob));

        audioElement.onloadedmetadata = () => {
            resolve(audioElement.duration);
        };

        audioElement.onerror = (error) => {
            console.error('Error getting audio duration:', error);
            reject(error);
        };
    });
};
  
  // Function to match sound criteria
  const checkSoundMatch = (frequency, duration, expectedSound) => {
    // Define frequency and duration ranges for each sound type
    // if (expectedSound === 'blowing') {
    //   return frequency >= 5000 && frequency <= 7000 && duration >= 1; // Example duration check
    // } else if (expectedSound === 'hissing') {
    //   return frequency >= 3000 && frequency <= 5000 && duration >= 1;
    // } else if (expectedSound === 'buzzing') {
    //   return frequency >= 100 && frequency <= 300 && duration >= 1;
    // }
    // return false;
    return true;
  };

  return (
    <div className="App">
      <h1>Snake, Bees & Tornadoes</h1>
      <Board board={board} playerPosition={playerPosition} />

      {/* Microphone Selection */}
      <div>
        <label htmlFor="mic-select">Select your microphone:</label>
        <select
          id="mic-select"
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
        >
          {microphones.map((mic) => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label || 'Microphone'}
            </option>
          ))}
        </select>
      </div>

      <div className="controls">
        <button onClick={rollDice} disabled={!isPlayerTurn || playerPosition === 100}>
          Roll Dice
        </button>
        <p>{message}</p>
        <p>Your Position: {playerPosition}</p>
      </div>

      {/* Modal for sound tasks */}
      <Modal
        isOpen={modalIsOpen}
        
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}
        contentLabel="Sound Modal"
      >
        <h2>{modalMessage.text}</h2>
        <p>Make a sound like: <strong>{modalMessage.sound}</strong></p>
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        <button onClick={handleConfirmSound} disabled={!recordedBlob || isProcessing}>
          {isProcessing ? 'Processing...' : 'Check the sound!'}
        </button>
        <button 
          onClick={() => { setModalIsOpen(false);
          setRecordedBlob(null);
          setMessage("You didn't do the task! You're staying where you are.");
          setIsPlayerTurn(true);
          }}>
          Cancel
        </button>
        <p><strong>{modalMessage.check}</strong></p>
      </Modal>
    </div>
  );
};

export default App;
