const video = document.querySelector('.player__video');
const progress = document.querySelector('.progress');
const videoProgressBar = document.querySelector('.progress__filled');
const playBtn = document.querySelector('.player__button');
const volumeSlider = document.querySelector('input[name="volume"]');
const playbackRate = document.querySelector('input[name="playbackRate"]');
const forwardRewindBtns = document.querySelectorAll('.player__button[data-skip]');
forwardRewindBtns.forEach(btn => btn.addEventListener('click', skipVideo));
let mousedown = false;

video.addEventListener('timeupdate', videoPlaying);
video.addEventListener('ended', videoEnded);
playBtn.addEventListener('click', togglePlay);
volumeSlider.addEventListener('input', changeVolume);
playbackRate.addEventListener('input', changeRate);
progress.addEventListener('click', scrubVideo);
progress.addEventListener('mousemove', (e)=> mousedown && scrubVideo(e));
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mouseup', () => mousedown = false);

function togglePlay(){
  if(video.paused){
    video.play();
    playBtn.innerHTML = '&#10074;&#10074;';
  } else {
    video.pause();
    playBtn.innerHTML = '&#9654;';
  }
}

function changeVolume(e){
  video.volume = e.target.value;
}

function changeRate(e){
  video.playbackRate = e.target.value;
}

function skipVideo(e){
  let skipTime = Number(e.target.getAttribute('data-skip'));
  let currTime = video.currentTime;
  let skipTo = currTime + skipTime;
  video.currentTime = skipTo;
}

function videoEnded(e){
  console.log(e);
  playBtn.innerHTML = '&#9654;';
}

function videoPlaying(e){
  let videoPlaybackPercentage = (video.currentTime/video.duration) * 100;
  videoProgressBar.style.flexBasis = `${videoPlaybackPercentage}%`;
}

function scrubVideo(e){
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}