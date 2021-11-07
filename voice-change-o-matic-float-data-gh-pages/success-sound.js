// var context = new AudioContext();
// var osc1 = context.createOscillator(),
//     osc2 = context.createOscillator();
    
// osc1.type = 'triangle';
// osc2.type = 'triangle';
// var volume = context.createGain();

// volume.gain.value = 0.1;
// // Connect oscillators to the GainNode
// osc1.connect(volume);
// osc2.connect(volume);

// // Connect GainNode to the speakers
// volume.connect(context.destination);
// // How long to play oscillator for (in seconds)
// var duration = 2;

// // When to start playing the oscillators
// var startTime = context.currentTime;

// // Start the oscillators
// osc1.start(startTime);
// osc2.start(startTime);

// // Stop the oscillators 2 seconds from now
// osc1.stop(startTime + duration);
// osc1.stop(startTime + duration);
// var frequency = 493.883;

// osc1.frequency.value = frequency;
// osc2.frequency.value = frequency;

// var frequency = 493.883;///chorus effect

// osc1.frequency.value = frequency + 1;
// osc2.frequency.value = frequency - 2;

// // Set the volume to be 0.1 just before the end of the tone
// volume.gain.setValueAtTime(0.1, startTime + duration - 0.05);

// // Make the volume ramp down to zero 0.1 seconds after the end of the tone
// volume.gain.linearRampToValueAtTime(0, startTime + duration);

// Play oscillators at certain frequency and for a certain time
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

// Play a 'B' now that lasts for 0.116 seconds
//playNote(493.883, context.currentTime, 0.116);

// Play an 'E' just as the previous note finishes, that lasts for 0.232 seconds
//playNote(659.255, context.currentTime + 0.116, 0.232);

var playSuccessSound = function () {
    // Play a 'B' now that lasts for 0.116 seconds
    playNote(493.883, context.currentTime, 0.116);

    // Play an 'E' just as the previous note finishes, that lasts for 0.232 seconds
    playNote(659.255, context.currentTime + 0.116, 0.232);
};

// var myFakeAjaxCall = function (callback) {
//     setTimeout(function () {
//         callback();
//     }, 3000);
// };