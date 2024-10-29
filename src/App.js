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

  const snakePositions = getRandomPositions(10);
  const beePositions = getRandomPositions(10);
  const tornadoPositions = getRandomPositions(10);

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

// Define sound characteristics for hissing, blowing, and buzzing
const soundCharacteristics = {
  buzzing: { frequency: { min: 100, max: 250 }, amplitude: { min: 20, max: 80 }, minDuration: 4.5 },
  hissing: { frequency: { min: 250, max: 350 }, amplitude: { min: 5, max: 40 }, minDuration: 4.5 },
  blowing: { frequency: { min: 200, max: 3000 }, amplitude: { min: 30, max: 70 }, minDuration: 4 },
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
    if (tile) { // Check if the tile exists
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

  const analyzeAudio = async (audioBlob) => {
    return new Promise((resolve, reject) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const audioBuffer = await audioCtx.decodeAudioData(event.target.result);
                const analyser = audioCtx.createAnalyser();
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const waveArray = new Uint8Array(analyser.fftSize);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;

                // Connect to analyser and a GainNode to prevent audio output
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 0; // Prevent audio playback
                source.connect(analyser);
                analyser.connect(gainNode);
                gainNode.connect(audioCtx.destination); // Still connects to destination but no sound due to gain = 0

                source.start();

                // Analyze after audio has played
                setTimeout(() => {
                    analyser.getByteFrequencyData(dataArray);
                    analyser.getByteTimeDomainData(waveArray);

                    // Analyze frequency, amplitude and envelope data
                    const frequencyData = analyzeFrequencyData(dataArray, audioCtx);
                    const envelopeData = analyzeEnvelopeData(waveArray);

                    resolve({ frequencyData, envelopeData });
                }, 500);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(audioBlob);
    });
};

const analyzeAmplitudeData = (waveArray) => {
  let sum = 0;

  for (let i = 0; i < waveArray.length; i++) {
      const normalizedSample = (waveArray[i] - 128) / 128; // Normalize to -1 to 1
      sum += Math.abs(normalizedSample); // Absolute value for amplitude
  }

  const averageAmplitude = sum / waveArray.length;
  return averageAmplitude;
};


  const analyzeFrequencyData = (dataArray, audioCtx) => {
    let totalEnergy = 0;
    let maxAmplitude = -Infinity;
    let peakIndex = -1;

    for (let i = 0; i < dataArray.length; i++) {
      totalEnergy += dataArray[i];
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i];
        peakIndex = i;
      }
    }

    // Average frequency power
    const averageEnergy = totalEnergy / dataArray.length;

    // Convert peak index to frequency using audioCtx's sample rate
    const nyquist = audioCtx.sampleRate / 2;
    const frequency = (peakIndex * nyquist) / dataArray.length;

    return { frequency, averageEnergy, maxAmplitude };
  };

  const analyzeEnvelopeData = (waveArray) => {
    let sumSquares = 0;

    for (let i = 0; i < waveArray.length; i++) {
        const normalizedSample = (waveArray[i] - 128) / 128; // Normalize to -1 to 1
        sumSquares += normalizedSample * normalizedSample;
    }

    const rms = Math.sqrt(sumSquares / waveArray.length);
    const averageAmplitude = analyzeAmplitudeData(waveArray);
    return { rms, averageAmplitude }; // Return both RMS and average amplitude
};

const handleConfirmSound = async () => {
  if (!recordedBlob) {
      setModalMessage((prev) => ({ ...prev, check: 'You need to make a sound first!' }));
      return;
  }

  setIsProcessing(true); // Start processing
  try {
      const { frequencyData, envelopeData } = await analyzeAudio(recordedBlob);
      const audioDuration = await getAudioDuration(recordedBlob);
      
      console.log("Duration: " + audioDuration + "s");
      console.log("Frequency Data: ", frequencyData);  // Log frequency data
      console.log("Envelope Data: ", envelopeData);    // Log envelope data

      // Determine the sound type based on frequency
      let soundTypeMatched = '';
      if (checkSoundMatch(frequencyData.frequency, 'buzzing')) {
          soundTypeMatched = 'buzzing';
      } else if (checkSoundMatch(frequencyData.frequency, 'hissing')) {
          soundTypeMatched = 'hissing';
      } else if (checkSoundMatch(frequencyData.frequency, 'blowing')) {
          soundTypeMatched = 'blowing';
      } else {
          soundTypeMatched = 'no match';
      }

      // Update the modal message with the result
      setModalMessage((prev) => ({
          ...prev,
          check: `Sound detected: ${soundTypeMatched}.`
      }));

  } catch (error) {
      console.error('Error during sound confirmation:', error);
      setModalMessage((prev) => ({ ...prev, check: "An error occurred while checking the sound." }));
  } finally {
      setIsProcessing(false); // Reset processing state
  }
};

  // Function to get audio duration
  const getAudioDuration = (audioBlob) => {
    return new Promise((resolve, reject) => {
      console.log("Getting duration for blob:", audioBlob); // Log the blob

      const audioElement = new Audio(URL.createObjectURL(audioBlob));

      // Wait for metadata to load
      audioElement.onloadedmetadata = () => {
        console.log('Audio Duration:', audioElement.duration); // Log duration for debugging
        if (audioElement.duration === Infinity) {
          reject(new Error("Audio duration is infinity."));
        } else {
          resolve(audioElement.duration);
        }
      };

      audioElement.onerror = (error) => {
        console.error('Error getting audio duration:', error);
        reject(error);
      };

      // Ensure the audio element is played to get duration
      audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        reject(error);
      });
    });
  };

  const checkSoundMatch = (frequency, expectedSound) => {
    // Define frequency ranges for each sound type
    const characteristics = soundCharacteristics[expectedSound];

    if (characteristics) {
        // Example: Check if frequency is within range
        if (frequency >= characteristics.frequency.min && frequency <= characteristics.frequency.max) {
            return true; // Match found
        }
    }
    return false; // No match found
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

        {recordedBlob && (
          <div>
            <audio controls>
              <source src={URL.createObjectURL(recordedBlob)} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        <button onClick={handleConfirmSound} disabled={!recordedBlob || isProcessing}>
          {isProcessing ? 'Processing...' : 'Check the sound!'}
        </button>
        <button 
          onClick={() => { 
            setModalIsOpen(false);
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
