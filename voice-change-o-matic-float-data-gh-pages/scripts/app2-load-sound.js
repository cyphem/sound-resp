// fork getUserMedia for multiple browser versions, for those
// that need prefixes

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var voiceSelect = document.getElementById("voice");
var source;
var stream;

// grab the mute button to use below

var mute = document.querySelector('.mute');

//set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();
///////////////////////////////////////////////////////////
// get the audio element
// const audioElement = document.querySelector('audio');
const audioElement = document.querySelector('audio');
var audioContext = new AudioContext();

audio_file.onchange = function(){
  var files = this.files;
  var file = URL.createObjectURL(files[0]); 
audioElement = file;
}


// pass it into the audio context
const track = audioContext.createMediaElementSource(audioElement);
track.connect(audioContext.destination);
const playButton = document.querySelector('button');

playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }

}, false);

audioElement.addEventListener('ended', () => {
  playButton.dataset.playing = 'false';
}, false);
/////////////////////////////////////////////////

// distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

// grab audio track via XHR for convolver node

var soundSource, concertHallBuffer;

ajaxRequest = new XMLHttpRequest();

ajaxRequest.open('GET', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', true);

ajaxRequest.responseType = 'arraybuffer';


ajaxRequest.onload = function() {
  var audioData = ajaxRequest.response;

  audioCtx.decodeAudioData(audioData, function(buffer) {
      concertHallBuffer = buffer;
      soundSource = audioCtx.createBufferSource();
      soundSource.buffer = concertHallBuffer;
    }, function(e){"Error with decoding audio data" + e.err});

  //soundSource.connect(audioCtx.destination);
  //soundSource.loop = true;
  //soundSource.start();
}

ajaxRequest.send();

// set up canvas context for visualizer

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;

canvas.setAttribute('width',intendedWidth);

var visualSelect = document.getElementById("visual");

var drawVisual;

//main block for doing the audio recording

if (navigator.getUserMedia) {
   console.log('getUserMedia supported.');
   navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      },

      // Success callback
      function(stream) {
         source = audioCtx.createMediaStreamSource(stream);
         source.connect(analyser);
         analyser.connect(distortion);
         distortion.connect(biquadFilter);
         biquadFilter.connect(convolver);
         convolver.connect(gainNode);
         gainNode.connect(audioCtx.destination);

      	 visualize();
         voiceChange();

      },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );
} else {
   console.log('getUserMedia not supported on your browser!');
}

var digi;

function visualize() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;


  var visualSetting = visualSelect.value;



  if(visualSetting == "sinewave") {
    analyser.fftSize = 1024;
    var bufferLength = analyser.fftSize;
    console.log(bufferLength);
    var dataArray = new Float32Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
    
      drawVisual = requestAnimationFrame(draw);

      analyser.getFloatTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtx.beginPath();
   
      var sliceWidth = WIDTH * 1.0 / bufferLength;

      var x = 0;
     
//if (dataArray[10] * 200.0 > 1){console.log( "found it");}
if (dataArray[10] * 200.0 > 1){audioElement.play();console.log( "found it");}//plays sound file
//if (dataArray[10] * 200.0 > 1){console.log( "found it"); playSuccessSound();}//plays generated sound



      for(var i = 0; i < bufferLength; i++) {
   
        var v = dataArray[i] * 200.0;
        var y = HEIGHT/2 + v;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
    };

    draw();

  } else if(visualSetting == "frequencybars") {
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Float32Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      // console.log(bufferLength);
      // console.log(visualSetting);
      //console.log(bufferLength);
      // console.log(bufferLength);
      drawVisual = requestAnimationFrame(draw);

      analyser.getFloatFrequencyData(dataArray);
     digi=  dataArray[10] ;
     //console.log(digi);

     //if(digi > 100){ audioElement.play();}

     //if(digi >= 0.00){ console.log(digi);}

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] + 140)*2;
        
        canvasCtx.fillStyle = 'rgb(' + Math.floor(barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };

    draw();

  } else if(visualSetting == "off") {
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = "red";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  }

}

function voiceChange() {
  distortion.curve = new Float32Array(analyser.fftSize);
  distortion.oversample = '4x';
  biquadFilter.gain.value = 0;
  convolver.buffer = undefined;

  var voiceSetting = voiceSelect.value;
  console.log(voiceSetting);

  if(voiceSetting == "distortion") {
    distortion.curve = makeDistortionCurve(400);
  } else if(voiceSetting == "convolver") {
    convolver.buffer = concertHallBuffer;
  } else if(voiceSetting == "biquad") {
    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.value = 1000;
    biquadFilter.gain.value = 25;
  } else if(voiceSetting == "off") {
    console.log("Voice settings turned off");
  }

}

// event listeners to change visualize and voice settings

visualSelect.onchange = function() {
  window.cancelAnimationFrame(drawVisual);
  visualize();
}

voiceSelect.onchange = function() {
  voiceChange();
}

mute.onclick = voiceMute;

function voiceMute() {
  if(mute.id == "") {
    gainNode.gain.value = 0;
    mute.id = "activated";
    mute.innerHTML = "Unmute";
  } else {
    gainNode.gain.value = 1;
    mute.id = "";    
    mute.innerHTML = "Mute";
  }
}


var context = new AudioContext();
var playNote = function (frequency, startTime, duration) {

    var osc1 = context.createOscillator(),
        osc2 = context.createOscillator(),
        volume = context.createGain();

    // Set oscillator wave type
    osc1.type = 'triangle';
    osc2.type = 'triangle';

    volume.gain.value = 0.1;    

    // Set up node routing
    osc1.connect(volume);
    osc2.connect(volume);
    volume.connect(context.destination);

    // Detune oscillators for chorus effect
    osc1.frequency.value = frequency + 1;
    osc2.frequency.value = frequency - 2;

    // Fade out
    volume.gain.setValueAtTime(0.1, startTime + duration - 0.05);
    volume.gain.linearRampToValueAtTime(0, startTime + duration);

    // Start oscillators
    osc1.start(startTime);
    osc2.start(startTime);

    // Stop oscillators
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
};

var playSuccessSound = function () {
  // Play a 'B' now that lasts for 0.116 seconds
  playNote(493.883, context.currentTime, 5);

  // Play an 'E' just as the previous note finishes, that lasts for 0.232 seconds
  //playNote(659.255, context.currentTime + 0.116, 0.232);
};
