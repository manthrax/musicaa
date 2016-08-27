
function musicaaUI(){
    var player;

    this.tempoChanged = function(val){
        this.player.generator.params.tempo = val|0;
    }
    this.playPause = function (){
        if(this.player){
            this.player.paused=!this.player.paused;
            if(this.player.paused)
                this.player.paused = true;
            else this.player.play();
            document.getElementById('ppause').innerHTML=this.player.paused?'Play':'Stop';
        }
    }
    this.play = function (type) {
        type = type ? type : 'beethoven';
        var generator = musicaa.composers[type];
        if(!this.player)
            this.player = musicaa.sequencer();
        var player = this.player;
        player.generator = generator;
        player.reset();
        if(player.paused)
            return;
        player.play();

        /*//TEST OUT THE DIFFERENT NOTES FOR AN INSTRUMENT...
        for(var i=21;i<=108;i++){
            setTimeout(function(vi){
                return function(){
                    var note = (18+''+vi);
                    MIDI.noteOn(1,0|note,100)
                    console.log(note)
                }
                }(i), (i - 21)*200)
        }
        return;
        */
    }

    function playMidi() {
        if (this.paused) {
            return;
        }
        if(!this.playing)
            this.playing = true;
        this.cursor = this.cursor ? this.cursor : 0;
        while (this.cursor < this.sequence.length) {
            var elem = this.sequence[this.cursor];
            if (window.vis3) {
                vis3.event(elem);
            }
            this.cursor++;
            if (elem.cmd == 'noteOn') {
                MIDI.noteOn(elem.channel, elem.note, elem.velocity, elem.duration);
            } else if (elem.cmd == 'noteOff') {
                MIDI.noteOff(elem.channel, elem.delay);
            } else if (elem.cmd == 'sleep') {
                setTimeout(function(seq) {
                    return function() {
                        seq.play()
                    }
                }(this), elem.duration);
                return;
            }
        }
        this.generator.generate(this);
        if(this.playing){
            this.play();
        }else{
            delete this.cursor;
            delete this.playing;
        }
    }

    this.sequencer = function () {
        var ctx = {
            sequence: [],
            reset:function(){
                this.sequence=[];
                delete this.paused;
                delete this.cursor;
                delete this.playing;;
                return this;
            },
            noteOn: function(channel, note, velocity, duration) {
                this.sequence.push({
                    cmd: 'noteOn',
                    channel: channel,
                    note: note,
                    velocity: velocity,
                    duration: duration
                });
                return this;
            },
            noteOff: function(channel, delay) {
                this.sequence.push({
                    cmd: 'noteOff',
                    delay: delay
                });
                return this;
            },
            sleep: function(duration) {
                this.sequence.push({
                    cmd: 'sleep',
                    duration: (duration / 1000) | 0
                });
                return this;
            },
            play: playMidi,
            stop: function() {
                this.paused = true;
            }
        };
        return ctx;
    }

    //var fontURL = './MIDI.js-master/examples/soundfont/'
    //var instruments = ['acoustic_grand_piano', 'synth_drum']
    /*
    var fontURL = './midi-js-soundfonts-master/MusyngKite/'
    var instruments = ['harpsichord', 'cello']
    var fontURL = './midi-js-soundfonts-master/FluidR3_GM/'
    var instruments = ['sitar', 'shanai']
    var instruments = ['sitar', 'shanai']
    var instruments = ['string_ensemble_1', 'shanai']
    */

    //var fontURL = './midi-js-soundfonts-master/FluidR3_GM/'

    var fontURL = './soundfonts/midijs/'
    var fontURL = './soundfonts/MusyngKite/'
    var fontURL = './soundfonts/FluidR3_GM/'
    var instruments = ['acoustic_grand_piano', 'synth_drum']
    var iselectors = [];

    this.loadInstruments = function(ondone) {
        if(MIDI.Player.stop)
            MIDI.Player.stop();
        if(this.player)
            this.player.paused = true;
        MIDI.loadPlugin({
            soundfontUrl: fontURL,
            instruments: instruments,
            onprogress: function(state, progress) {
                var prog = (progress*100)|0;
                var stat = document.getElementById('status');
                stat.innerHTML=prog<100?state+' '+prog+'%':'ready.';
                //console.log(state, progress);
            },
            onsuccess: function(player){ return function() {
                MIDI.setInstrument(0, MIDI.GM.byName[instruments[0]].number, 0)
                MIDI.setInstrument(1, MIDI.GM.byName[instruments[1]].number, 0)
                if(ondone)ondone();
                MIDI.Player.start();
                if(player && player.paused){
                    player.paused = false;
                    player.play();
                }
            }}(this.player)
        });
    }

    this.instrumentSelected = function (id) {
        if(this.player)
            this.player.stop();
        var elem = iselectors[id];
        instruments[id] = elem.value;
        this.loadInstruments();
    }

    document.body.onload = function() {
        function buildSelector(id) {
            var elem = document.getElementById('inst' + id);
            iselectors.push(elem);
            var st = '';
            for (var i in MIDI.GM.byName)
                st += '<option ' + (i == instruments[id] ? 'selected ' : '') + ' value="' + i + '" onselect>' + i + '</option>';
            elem.innerHTML = st;
        }
        buildSelector(0);
        buildSelector(1);

        if (window.vis3) {
            vis3.start();
        }

        musicaa.loadInstruments(function(){
            MIDI.setVolume(0, 127);
            musicaa.play('beethoven', 10);
        });
    }
}

musicaaUI.call(musicaa);