
function musicaaUI(){
    var player;

    this.tempoChanged = function(val){
        val|=0;
        this.player.generator.params.tempo = val;
        document.getElementById('tempoText').innerHTML='Tempo:'+val
    }
    this.playPause = function (){
        if(this.player){
            if(this.player.paused)
                this.play();
            else
                this.pause();
        }
    }
    this.pause = function () {
        this.player.paused=true;
        this.player.wasPlaying=false;
        document.getElementById('ppause').innerHTML='Play';
    }
    this.play = function (type) {
        document.getElementById('ppause').innerHTML='Stop';

        type = type ? type : 'beethoven';
        var generator = musicaa.composers[type];
        if(!this.player)
            this.player = musicaa.sequencer();
        var player = this.player;
        player.generator = generator;
        
    this.tempoChanged(this.player.generator.params.tempo)

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
    var instruments = ['acoustic_grand_piano', 'melodic_tom','acoustic_bass']
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
                for(var i=0;i<instruments.length;i++){
                    MIDI.setInstrument(i, MIDI.GM.byName[instruments[i]].number, 0)
                }
                if(ondone)
                    ondone();
                MIDI.Player.start();
                if(player && player.paused && player.wasPlaying){
                    player.paused = false;
                    player.play();
                }
            }}(this.player)
        });
    }

    this.instrumentSelected = function (id) {
        if(this.player){
            if(!this.player.paused){
                this.player.wasPlaying = true;
            }
            this.player.stop();
        }
        var elem = iselectors[id];
        instruments[id] = elem.value;
        this.loadInstruments();
    }

    document.body.onload = function() {
        function buildSelector(id) {
            var elem = document.getElementById('inst' + id);
            if(elem){
                iselectors.push(elem);
                var st = '';
                for (var i in MIDI.GM.byName)
                    st += '<option ' + (i == instruments[id] ? 'selected ' : '') + ' value="' + i + '" onselect>' + i + '</option>';
                elem.innerHTML = st;
            }
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