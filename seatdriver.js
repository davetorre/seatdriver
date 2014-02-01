var context,
    bufferLoader,
    bufferList = [],
    drumMachine,
    music,
    playButton = document.getElementById('playButton'),
    pauseButton = document.getElementById('pauseButton'),
    stopButton = document.getElementById('stopButton');

bufferLoader = {
    urlList: ["audio/SeatDriver073013kick.mp3",
              "audio/SeatDriver073013snare.mp3",
              "audio/SeatDriver073013bg.mp3",
              "audio/Cowbell.mp3"
             ],
    loadBuffer: function (url, index) {
        var request = new XMLHttpRequest(),
            that = this;
        function callback(buffer) {
            bufferList[index] = buffer;
            if (index + 1 === that.urlList.length) {
                document.getElementById('title').innerHTML = 'Seat Driver';
                document.getElementById('title2').innerHTML =
                                            'Click some stuff, beatmaker.';
            }
        }
        request.open("get", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            context.decodeAudioData(request.response, callback);
        };
        request.send();
    },
    load: function () {
        var i;
        for (i = 0; i < this.urlList.length; i += 1) {
            this.loadBuffer(this.urlList[i], i);
        }
    }
};

drumMachine = {
    kickArray: [],
    snareArray: [],
    currentStep: 0,
    numOfSteps: 16,
    nextStepTime: null,
    tempo: 112,
    lookAheadTime: 0.15,
    timerID: null,
    isPlaying: false,
    start: function (stepNumber, time) {
        if (!this.isPlaying) {
            this.currentStep = stepNumber;
            this.nextStepTime = time;
            this.isPlaying = true;
            this.scheduler();
        }
    },
    playSound: function (buffer, delay) {
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = false;
        source.connect(context.destination);
        source.noteOn(delay);
    },
    scheduler: function () {
        var that = this;
        function callScheduler() {
            that.scheduler();
        }
        if (this.nextStepTime < context.currentTime + this.lookAheadTime) {
            if (this.kickArray[this.currentStep] === true) {
                this.playSound(bufferList[0], this.nextStepTime);
            }
            if (this.snareArray[this.currentStep] === true) {
                this.playSound(bufferList[1], this.nextStepTime);
            }
            this.nextStepTime += 60 / (this.tempo * 4);
            this.currentStep += 1;
            if (this.currentStep === this.numOfSteps) {
                this.currentStep = 0;
            }
        }
        this.timerID = window.setTimeout(callScheduler, 100.0);
    },
    toggleKick: function (id) {
        var btn = document.getElementById(id),
            index = id.slice(1);
        if (this.kickArray[index] === false) {
            btn.style.backgroundColor = "#FFFFFF";
            this.kickArray[index] = true;
        } else {
            btn.style.backgroundColor = "#5d5d5d";
            this.kickArray[index] = false;
        }
    },
    toggleSnare: function (id) {
        var btn = document.getElementById(id),
            index = id.slice(1);
        if (this.snareArray[index] === false) {
            btn.style.backgroundColor = "#FFFFFF";
            this.snareArray[index] = true;
        } else {
            btn.style.backgroundColor = "#5d5d5d";
            this.snareArray[index] = false;
        }
    },
    stop: function () {
        window.clearTimeout(this.timerID);
        this.isPlaying = false;
    }
};

music = {
    isPlaying: false,
    source: null,
    start: function () {
        if (!this.isPlaying) {
            this.source = context.createBufferSource();
            this.source.buffer = bufferList[2];
            this.source.loop = false;
            this.source.connect(context.destination);
            this.source.noteOn(0);
            this.isPlaying = true;
        }
    },
    stop: function () {
        this.source.disconnect();
        this.isPlaying = false;
    }
};

playButton.onclick = function () {
    music.start();
    drumMachine.start(0, context.currentTime);
};

pauseButton.onclick = function () {
    //have not solved the pause problem yet, cowbell button for now
    drumMachine.playSound(bufferList[3], 0);
};

stopButton.onclick = function () {
    music.stop();
    drumMachine.stop();
};

function init() {
    var i;
    context = new webkitAudioContext();

    //start with a simple drum pattern
    for (i = 0; i < 16; i += 1) {
        drumMachine.kickArray[i] = false;
        drumMachine.snareArray[i] = false;
    }
    drumMachine.toggleKick('k0');
    drumMachine.toggleKick('k8');
    drumMachine.toggleSnare('s4');
    drumMachine.toggleSnare('s12');

    //load all audio files
    bufferLoader.load();
}

window.onload = init();