var context,
    kickArray = [],
    snareArray = [],
    bufferLoader,
    urlList = ["audio/SeatDriver073013kick.mp3",
               "audio/SeatDriver073013snare.mp3",
               "audio/SeatDriver073013bg.mp3",
               "audio/Cowbell.mp3"
              ],
    bufferList = [],
    numOfSteps = 16,
    currentStep,
    nextStepTime,
    tempo = 112.0,
    timerID,
    isPlaying = false,
    lookAheadTime = 0.2,
    backTrackSource;

bufferLoader = {
    loadBuffer: function (url, index) {
        var request = new XMLHttpRequest();
        function callback(buffer) {
            bufferList[index] = buffer;
            if (index + 1 === urlList.length) {
                document.getElementById('title').innerHTML = 'Seat Driver';
                document.getElementById('title2').innerHTML = 'Click some stuff, beatmaker.';
            }
        }
        request.open("get", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            context.decodeAudioData(request.response, callback);
        }
        request.send();
    },
    load: function () {
        for (var i = 0; i < urlList.length; i += 1) {
            this.loadBuffer(urlList[i], i);
        }
    }
};

function playSound(buffer, delay) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = false;
    source.connect(context.destination);
    source.noteOn(delay);
}

function scheduler() {
    if (nextStepTime < context.currentTime + lookAheadTime) {
        if (kickArray[currentStep] === true) {
            playSound(bufferList[0], nextStepTime);
        }
        if (snareArray[currentStep] === true) {
            playSound(bufferList[1], nextStepTime);
        }
        nextStepTime += 60 / (tempo * 4);
        currentStep += 1;
        if (currentStep === numOfSteps) {
            currentStep = 0;
        }
    }
    timerID = window.setTimeout(scheduler, 100.0);
}

function startPlayback() {
    if (!isPlaying) {
        backTrackSource = context.createBufferSource();
        backTrackSource.buffer = bufferList[2];
        backTrackSource.loop = false;
        backTrackSource.connect(context.destination);
        backTrackSource.noteOn(0);
        nextStepTime = context.currentTime;
        currentStep = 0;
        scheduler(); //start the clock
        isPlaying = true;
    }
}

function pausePlayback() {
    playSound(bufferList[3], 0); //have not solved the pause problem yet, cowbell button for now
}

function stopPlayback() {
    backTrackSource.disconnect();
    window.clearTimeout(timerID);
    isPlaying = false;
}

function toggleKick(id) {
    var btn = document.getElementById(id),
        index = id.slice(1);
    if (kickArray[index] === false) {
        btn.style.backgroundColor = "#FFFFFF";
        kickArray[index] = true;
    } else {
        btn.style.backgroundColor = "#5d5d5d";
        kickArray[index] = false;
    }
}

function toggleSnare(id) {
    var btn = document.getElementById(id),
        index = id.slice(1);
    if (snareArray[index] === false) {
        btn.style.backgroundColor = "#FFFFFF";
        snareArray[index] = true;
    } else {
        btn.style.backgroundColor = "#5d5d5d";
        snareArray[index] = false;
    }
}

function init() {
    var i;
    context = new webkitAudioContext();
    for (i = 0; i < 16; i += 1) {
        kickArray[i] = false;
        snareArray[i] = false;
    }
    toggleKick('k0');
    toggleKick('k8');
    toggleSnare('s4');
    toggleSnare('s12');
    bufferLoader.load();
}

window.onload = init();