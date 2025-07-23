let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source, currentBuffer;
let playlist = [];
let currentTrack = 0;

let gainNode = audioCtx.createGain();
let bassEQ = audioCtx.createBiquadFilter();
bassEQ.type = "lowshelf";
bassEQ.frequency.value = 200;

let midEQ = audioCtx.createBiquadFilter();
midEQ.type = "peaking";
midEQ.frequency.value = 1000;
midEQ.Q.value = 1;

let trebleEQ = audioCtx.createBiquadFilter();
trebleEQ.type = "highshelf";
trebleEQ.frequency.value = 3000;

bassEQ.connect(midEQ);
midEQ.connect(trebleEQ);
trebleEQ.connect(gainNode);
gainNode.connect(audioCtx.destination);

document.getElementById('fileInput').addEventListener('change', handleFiles);
document.getElementById('play').addEventListener('click', playAudio);
document.getElementById('stop').addEventListener('click', stopAudio);
document.getElementById('next').addEventListener('click', () => changeTrack(1));
document.getElementById('prev').addEventListener('click', () => changeTrack(-1));

document.getElementById('volume').addEventListener('input', e => {
  gainNode.gain.value = e.target.value;
});

document.getElementById('bass').addEventListener('input', e => {
  bassEQ.gain.value = e.target.value;
});
document.getElementById('mid').addEventListener('input', e => {
  midEQ.gain.value = e.target.value;
});
document.getElementById('treble').addEventListener('input', e => {
  trebleEQ.gain.value = e.target.value;
});

function handleFiles(event) {
  const files = Array.from(event.target.files);
  playlist = files.filter(file => file.type.startsWith('audio/'));
  currentTrack = 0;
  loadTrack(currentTrack);
  displayPlaylist();
}

function displayPlaylist() {
  const div = document.getElementById('playlist');
  div.innerHTML = playlist.map((f, i) => `${i === currentTrack ? '▶️' : ''} ${f.name}`).join('<br>');
}

function loadTrack(index) {
  stopAudio();
  const file = playlist[index];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    audioCtx.decodeAudioData(e.target.result).then(buffer => {
      currentBuffer = buffer;
      displayPlaylist();
    });
  };
  reader.readAsArrayBuffer(file);
}

function playAudio() {
  if (source) source.stop();
  source = audioCtx.createBufferSource();
  source.buffer = currentBuffer;
  source.connect(bassEQ);
  source.start();
}

function stopAudio() {
  if (source) {
    source.stop();
    source.disconnect();
    source = null;
  }
}

function changeTrack(dir) {
  currentTrack += dir;
  if (currentTrack < 0) currentTrack = playlist.length - 1;
  if (currentTrack >= playlist.length) currentTrack = 0;
  loadTrack(currentTrack);
  setTimeout(() => playAudio(), 300);
}