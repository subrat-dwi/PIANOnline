const pianoKeys = document.querySelectorAll(".piano-keys .key"),
  volumeSlider = document.querySelector(".volume-slider"),
  keysCheckbox = document.querySelector(".keys-checkbox"),
  startRecBtn = document.querySelector("#start-recording"),
  stopRecBtn = document.querySelector("#stop-recording"),
  playRecBtn = document.querySelector("#play-recording"),
  saveRecBtn = document.querySelector("#save-recording");

// Import and initialize Tone.js Synth and Recorder
const synth = new Tone.Synth().toDestination();
const recorder = new Tone.Recorder(); // Recorder for audio
synth.connect(recorder); // Connect Synth to Recorder

let allKeys = [],
  recordedKeys = [],
  recordedTimes = [],
  recordingStartTime;

let isRecording = false;

// Open and Close Navigation
function openNav() {
  document.getElementById("nav-bar").style.left = "0";
}
function closeNav() {
  document.getElementById("nav-bar").style.left = "-250px";
}


const playTune = (key) => {
  const noteMap = {
    'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4',
    'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5',
    'l': 'D5', ';': 'E5', 'w': 'C#4', 'e': 'D#4',
      't': 'F#4', 'y': 'G#4', 'u': 'A#4', 'o': 'C#5', 'p':'D#5'
  };

  if (noteMap[key]) {
    synth.triggerAttackRelease(noteMap[key], "8n", Tone.now()); // Play the note

    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    clickedKey.classList.add("active");
    setTimeout(() => {
      clickedKey.classList.remove("active");
    }, 150);
  }
};

// Event Listener for Click on Piano Keys
pianoKeys.forEach(key => {
  allKeys.push(key.dataset.key);
  key.addEventListener("click", () => {
    const keyValue = key.dataset.key;
    if (isRecording) {
      const currentTime = Date.now() - recordingStartTime;
      recordedKeys.push(keyValue);
      recordedTimes.push(currentTime);
    }
    playTune(keyValue);
  });
});

// Volume Slider Control
const handleVolume = (e) => {
  synth.volume.value = Tone.gainToDb(e.target.value); // Adjust synth volume
};

// Start Recording with Tone.Recorder
const startRecording = async () => {
  recordedKeys = [];
  recordedTimes = [];
  recordingStartTime = Date.now();
  isRecording = true;

  await recorder.start(); // Start Tone.js Recorder
  console.log("Recording started...");

  startRecBtn.disabled = true;
  stopRecBtn.disabled = false;
  playRecBtn.disabled = true;
  saveRecBtn.disabled = true;
};

// Stop Recording and Prepare Audio Blob
const stopRecording = async () => {
  isRecording = false;

  const recording = await recorder.stop(); // Stop Tone.js Recorder
  console.log("Recording stopped.");

  // Create a download link for recorded audio
  const url = URL.createObjectURL(recording);
  saveRecBtn.href = url;
  saveRecBtn.download = "recording.webm"; // File name and format
  saveRecBtn.disabled = false;

  startRecBtn.disabled = false;
  stopRecBtn.disabled = true;
  playRecBtn.disabled = false;
};

// Play Back Recording
const playRecording = () => {
  let index = 0;
  const startTime = Date.now();

  const playNextKey = () => {
    if (index < recordedKeys.length) {
      const key = recordedKeys[index];
      const timeToWait = recordedTimes[index] - (Date.now() - startTime);

      if (timeToWait > 0) {
        setTimeout(() => {
          playTune(key);
          index++;
          playNextKey();
        }, timeToWait);
      } else {
        playTune(key);
        index++;
        playNextKey();
      }
    }
  };
  playNextKey();
};

// Key Press Event Listener
const pressedKey = (e) => {
  if (allKeys.includes(e.key)) {
    if (isRecording) {
      const currentTime = Date.now() - recordingStartTime;
      recordedKeys.push(e.key);
      recordedTimes.push(currentTime);
    }
    playTune(e.key);
  }
};

// Toggle Visibility of Keys
const showHideKeys = () => {
  pianoKeys.forEach(key => key.classList.toggle("hide"));
};

// Event Listeners
startRecBtn.addEventListener("click", startRecording);
stopRecBtn.addEventListener("click", stopRecording);
playRecBtn.addEventListener("click", playRecording);
keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);
