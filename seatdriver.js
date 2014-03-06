var context,
    bufferLoader,
    bufferList = [],
    drumMachine,
    music,
    finishedLoading,
    playButton = document.getElementById('playButton'),
    pauseButton = document.getElementById('pauseButton'),
    stopButton = document.getElementById('stopButton');

bufferLoader = {
    loadCount: 0,
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
            that.loadCount++;
            if (that.loadCount === that.urlList.length) {
                // do the rest of the prep work
                finishedLoading();
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

finishedLoading = function () {
    playButton.onclick = function () {
        music.start();
        drumMachine.start();
    };

    pauseButton.onclick = function () {
        //have not solved the pause problem yet, cowbell button for now
        drumMachine.playSound(bufferList[3], 0);
    };

    stopButton.onclick = function () {
        music.stop();
        drumMachine.stop();
    };
    document.getElementById('title').innerHTML = 'Seat Driver';
    document.getElementById('title2').innerHTML =
                                'Click some stuff, beatmaker.';
};

drumMachine = {
    kickArray: [],
    snareArray: [],
    nextStep: 0,
    numOfSteps: 16,
    nextStepTime: null,
    tempo: 112,
    lookAheadTime: 0.15,
    timerID: null,
    isPlaying: false,
    start: function () {
        if (!this.isPlaying) {
            this.nextStep = 0;
            this.nextStepTime = context.currentTime;
            this.isPlaying = true;
            this.scheduler();
        }
    },
    playSound: function (buffer, delay) {
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = false;
        source.connect(context.destination);
        source.start(delay);
    },
    scheduler: function () {
        var that = this;
        function callScheduler() {
            that.scheduler();
        }
        if (this.nextStepTime < context.currentTime + this.lookAheadTime) {
            if (this.kickArray[this.nextStep] === true) {
                this.playSound(bufferList[0], this.nextStepTime);
            }
            if (this.snareArray[this.nextStep] === true) {
                this.playSound(bufferList[1], this.nextStepTime);
            }
            this.nextStepTime += 60 / (this.tempo * 4);
            this.nextStep += 1;
            if (this.nextStep === this.numOfSteps) {
                this.nextStep = 0;
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
            this.source.start(0);
            this.isPlaying = true;
        }
    },
    stop: function () {
        this.source.disconnect();
        this.isPlaying = false;
    }
};

window.onload = function () {
    var i;
    context = new AudioContext();

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
};