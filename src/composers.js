if (!window.musicaa)
    musicaa = {};
function SeededRNG(_seed) {
    this.seed = _seed === undefined ? 0 : _seed;
}
SeededRNG.prototype.random = function() {
    var x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
}
if (!musicaa.composers)
    musicaa.composers = {};

musicaa.composers.beethoven = function(seed) {
    ctx = {};
    var tempo = 60;
    //60;//60;
    var piano = 0;
    //144
    ctx.params = {
        tempo: tempo
    };
    ctx.beat = 0;
    ctx.rng = new SeededRNG(seed ? seed : Math.random() * 100);
    function random(range) {
        return (ctx.rng.random() * range) | 0;
    }
    //chord generator
    function generateChord() {
        let root = random(12) + 48
        var third = root + 3 + random(2)
        if (third > 60) {
            third = third - 12
        }
        var fifth = root + 7
        if (fifth > 60) {
            fifth = fifth - 12
        }
        return [root, third, fifth]
    }
    ctx.generate = function(seq) {
        tempo = this.params.tempo;
        var beat = this.beat;
        if (beat == 0) {
            var chord = this.chord = generateChord()
            var voicing = this.voicing = chord.slice(0).sort()
            //sorted copy of chord...
            //Sorted copy of chord
            //melody note
            var melody = this.melody = chord[random(3)] + 24
            var melodyVelocity = this.melodyVelocity = 40 + random(20)
            seq.noteOn(piano, melody, melodyVelocity);
            //midiOut(144,  melody,  melodyVelocity)
            //bass note
            var bass = this.bass = chord[0] - 12
            var bassVelocity = this.bassVelocity = 20 + random(20)
            seq.noteOn(piano, bass, bassVelocity);
            //midiOut(144,  bass,  bassVelocity)
            //pedal
            //arghh no webmidi equivalent of this!
            //midiOut(0b10110000,  64,  127) 	//sustain on?
        }
        var chord = this.chord;
        var voicing = this.voicing;
        var melody = this.melody;
        var melodyVelocity = this.melodyVelocity;
        var bass = this.bass;
        var bassVelocity = this.bassVelocity;
        //for (var beat = 0; beat < 4; beat++) 
        //        {
        if (beat == 2) {
            if (random(2) == 0) {
                seq.noteOn(piano, melody, 0);
                //midiOut(144,  melody,  0)
                melody = chord[random(3)] + 24
                seq.noteOn(piano, melody, melodyVelocity - 5);
                //midiOut(144,  melody,  melodyVelocity - 5)
            }
        }
        seq.noteOn(piano, voicing[0], 20 + random(20));
        //midiOut(144,  voicing[0],  20 + random(20))
        seq.sleep(20000000 / tempo)
        seq.noteOn(piano, voicing[0], 0);
        //midiOut(144,  voicing[0],  0)
        seq.noteOn(piano, voicing[1], 10 + random(20));
        //midiOut(144,  voicing[1],  10 + random(20))
        seq.sleep(20000000 / tempo)
        if (beat == 3) {
            if (random(3) == 0) {
                seq.noteOn(piano, melody, 0);
                //midiOut(144,  melody,  0)
                melody = chord[random(3)] + 24
                seq.noteOn(piano, melody, melodyVelocity - 10);
                //midiOut(144,  melody,  melodyVelocity - 10)
            }
        }
        seq.noteOn(piano, voicing[1], 0);
        //midiOut(144,  voicing[1],  0)
        seq.noteOn(piano, voicing[2], 10 + random(20));
        //midiOut(144,  voicing[2],  10 + random(20))
        seq.sleep(20000000 / tempo)
        seq.noteOn(piano, voicing[2], 0);
        //midiOut(144,  voicing[2],  0)
        //        }
        if (beat == 3) {
            seq.noteOn(piano, melody, 0);
            //midiOut(144,  melody,  0)
            seq.noteOn(piano, bass, 0);
            //midiOut(144,  bass,  0)
            //No equiv! (i think this is controlled by the note duration, in midi.js)
            //midiOut(0b10110000,  64,  0) //sustain off?
            seq.sleep(5000)
        }
        this.beat = (beat + 1) & 3;
    }
    return ctx;
}()


musicaa.composers.jazz = function(seed) {
    var ctx = {
        params: {
            tempo: 100
        }
    };
    var tempo = ctx.params.tempo;
    ctx.rng = new SeededRNG(seed ? seed : Math.random() * 100);
    function random(range) {
        return (ctx.rng.random() * range) | 0;
    }
    var nil = undefined;
    var pianoChan = 0;//144;
    var bassChan = 2;//145;
    var drumChan = 1;//146;
    //piano notes
    var piano = [
        [nil, nil, nil, nil, nil, nil], 
        [nil, nil, nil, nil, 5, nil], 
        [nil, nil, nil, nil, 6, -1], 
        [nil, 4, nil, nil, 1, nil], 
        [nil, nil, nil, nil, 4, 1], 
        [nil, nil, 4, nil, 1, nil], 
        [nil, nil, 4, nil, nil, 1], 
        [nil, 8, nil, nil, -2, -1], 
        [nil, 3, 5, nil, -2, -1], 
        [nil, 9, -1, nil, -2, -1], 
        [nil, 6, -3, nil, 1, 1], 
        [nil, 3, 3, nil, -2, 1], 
        [nil, 1, 2, nil, 1, 1], 
        [nil, 10, -2, nil, -2, -1], 
        [nil, 7, -1, nil, -2, 1], 
        [nil, 4, -1, nil, 3, -1], 
        [nil, 3, nil, 3, -2, 1], 
        [1, 1, 1, nil, 3, -1], 
        [1, 1, 1, 3, -2, 1], ]
    var pianoNote = 64
    var pianoChords = [[4, 10, 14], [-2, 4, 9]]
    //bass notes
    var bass = [0, 5, -2, 3, -4, 1, 6, -1, 4, -3, 2, -5]
    var bassNote = 0
    //drum rhythms
    var ride = [
        [false, false, false, false, false, true], 
        [false, false, false, false, true, true], 
        [false, false, true, false, true, true]]
    var chord = pianoChords[bassNote % 2]
    var seq;
    
    function midiOut(chan,note,vel,delay){
        seq.noteOn(chan,note,vel,delay)
    }
    function usleep(dur){
        seq.sleep(dur)
    }
    
    function useconds_t(val){
        return val
    }
    function print(v){
        console.log(v);
    }

    ctx.generate = function(iseq) {
        seq=iseq;
        //main loop
        //select patterns
        var pianoPattern = random(piano.length)
        if (pianoPattern == 0) {
            pianoNote += 5
        }
        var ridePattern = random(ride.length)
        //play notes
        for (var i = 0; i < 6; i++) {
            //piano solo note on
            var note;
            if (note = piano[pianoPattern][i]) {
                midiOut(pianoChan, pianoNote + 12, 0)
                midiOut(pianoChan, pianoNote - 12, 0)
                midiOut(pianoChan, pianoNote, 0)
                pianoNote = pianoNote + note
                print(pianoNote)
                midiOut(pianoChan, pianoNote, 35 + random(60))
            }
            // piano chords
            if (i == 1 && random(4) == 0) {
                //piano chords off
                for (var note in chord) {
                    midiOut(pianoChan, note + bass[bassNote] + 48, 0)
                }
                var chordVelocity = 30 + random(50)
                for (var note in chord) {
                    midiOut(pianoChan, note + bass[bassNote] + 48, chordVelocity)
                }
            }
            if (i == 4) {
                if (bassNote < 6) {
                    chord = pianoChords[bassNote % 2]
                } else {
                    chord = pianoChords[1 - bassNote % 2]
                }
                var chordVelocity = 20 + random(50)
                for (var note in chord) {
                    midiOut(pianoChan, note + bass[bassNote] + 48, chordVelocity)
                }
            }
            //drums
            if (ride[ridePattern][i] == true) {
                midiOut(drumChan, 54, 20 + random(40))
                //ride on
                midiOut(drumChan, 54, 0)
                //ride off
            }
            if (i == 2) {
                midiOut(drumChan, 52, 30 + random(40))
                //hh on
                midiOut(drumChan, 52, 0)
                //hh off
            }
            //bass
            if (i == 2) {
                midiOut(bassChan, bass[bassNote] + 48, 0)
                //bass note off
                //reset bass notes
                bassNote += 1
                if (bassNote == 12) {
                    bassNote = 0
                }
                var rand = random(3)
                if (rand == 0) {
                    midiOut(bassChan, bass[bassNote] + 48 - 1, 50)
                    //bass note on
                }
                if (rand == 1) {
                    midiOut(bassChan, bass[bassNote] + 48 + 1, 50)
                    //bass note on
                }
            }
            if (i == 4) {
                var rand = random(4)
                if (rand == 0) {
                    midiOut(bassChan, bass[bassNote] + 48 - 1, 50)
                    //bass note on
                }
                if (rand == 1) {
                    midiOut(bassChan, bass[bassNote] + 48 + 1, 50)
                    //bass note on
                }
            }
            if (i == 5) {
                midiOut(bassChan, bass[bassNote] + 48 - 1, 0)
                //bass note off
                midiOut(bassChan, bass[bassNote] + 48 + 1, 0)
                //bass note off
                midiOut(bassChan, bass[bassNote] + 48, 50)
                //bass note on
            }
            //set time between notes
            if (i == 2 || i == 5) {
                usleep(useconds_t((60000000 * 1) / (tempo * 3)))
            }
            if (i == 0 || i == 3) {
                usleep(useconds_t((60000000 * 4) / (tempo * 15)))
            }
            if (i == 1 || i == 4) {
                usleep(useconds_t((60000000 * 2) / (tempo * 5)))
            }
            //piano chords off
            for (var note in chord) {
                midiOut(pianoChan, note + bass[bassNote] + 48, 0)
            }
        }
        //control the range of piano notes
        if (pianoNote > 90) {
            pianoNote -= 12
        } else if (pianoNote < 60) {
            pianoNote += 12
        } else {
            pianoNote = pianoNote - 12 * random(2)
        }
    }
    return ctx;
}();

musicaa.composers.jazzOld = function(seed) {
    var pianoChan = 0;
    //144
    var bassChan = 0;
    //144
    var drumChan = 1;
    //144
    var ctx = {
        params: {}
    };
    var tempo = ctx.params.tempo = 100;
    ctx.rng = new SeededRNG(seed ? seed : Math.random() * 100);
    function random(range) {
        return (ctx.rng.random() * range) | 0;
    }
    var nil = undefined;
    //piano notes
    var piano = [[nil, nil, nil, nil], [nil, nil, 5, nil], [nil, nil, 6, -1], [4, nil, 1, nil], [nil, nil, 4, 1], [nil, 4, 1, nil], [nil, 4, nil, 1], [8, nil, -2, -1], [3, 5, -2, -1], [9, -1, -2, -1], [6, -3, 1, 1], [3, 3, -2, 1], [1, 2, 1, 1], [10, -2, -2, -1], [7, -1, -2, 1], [4, -1, 3, -1]]
    var pianoNote = 64
    var pianoChords = [[4, 10, 14], [-2, 4, 9]]
    //bass notes
    var bass = [0, 5, -2, 3, -4, 1, 6, -1, 4, -3, 2, -5]
    var bassNote = 0
    //drum rhythms
    var ride = [[false, false, false, true], [false, false, true, true], [false, true, true, true]]
    var rideNote = 1870;
    // 54
    var hhNote = 18100;
    //52
    //1821 - 18108
    var chord = pianoChords[bassNote % 2]
    //main loop
    ctx.generate = function(seq) {
        tempo = ctx.params.tempo;
        //select patterns
        var pianoPattern = random(piano.length)
        if (pianoPattern == 0) {
            pianoNote += 5
        }
        var ridePattern = random(ride.length)
        //play notes
        for (var beat = 0; beat < 4; beat++) {
            //piano solo note on
            var note = piano[pianoPattern][beat];
            if (note) {
                pianoNote = pianoNote + note
                seq.noteOn(pianoChan, pianoNote, 35 + random(60))
            }
            //piano chords
            if (beat == 0 && random(4) == 0) {
                var chordVelocity = 20 + random(50)
                for (var note in chord) {
                    seq.noteOn(pianoChan, note + bass[bassNote] + 48, chordVelocity)
                }
            }
            if (beat == 2) {
                if (bassNote < 6) {
                    chord = pianoChords[bassNote % 2]
                } else {
                    chord = pianoChords[1 - bassNote % 2]
                }
                var chordVelocity = 20 + random(50)
                for (var note in chord) {
                    seq.noteOn(pianoChan, note + bass[bassNote] + 48, chordVelocity)
                }
            }
            //drums
            if (ride[ridePattern][beat] == true) {
                seq.noteOn(drumChan, rideNote, 20 + random(40))
                //ride on
                seq.noteOn(drumChan, rideNote, 0)
                //ride off
            }
            if (beat == 1) {
                seq.noteOn(drumChan, hhNote, 30 + random(40))
                //hh on
                seq.noteOn(drumChan, hhNote, 0)
                //hh off
            }
            //bass
            if (beat == 1) {
                seq.noteOn(bassChan, bass[bassNote] + 48, 0)
                //bass note off
                //reset bass notes
                bassNote += 1
                if (bassNote == 12) {
                    bassNote = 0
                }
                var rand = random(3)
                if (rand == 0) {
                    seq.noteOn(bassChan, bass[bassNote] + 48 - 1, 50)
                    //bass note on
                }
                if (rand == 1) {
                    seq.noteOn(bassChan, bass[bassNote] + 48 + 1, 50)
                    //bass note on
                }
            }
            if (beat == 3) {
                seq.noteOn(bassChan, bass[bassNote] + 48 - 1, 0)
                //bass note off
                seq.noteOn(bassChan, bass[bassNote] + 48 + 1, 0)
                //bass note off
                seq.noteOn(bassChan, bass[bassNote] + 48, 50)
                //bass note on
            }
            //set time between notes
            if (beat == 0 || beat == 2) {
                seq.sleep(24000000 / tempo)
            } else {
                seq.sleep(36000000 / tempo)
            }
            //piano note off
            seq.noteOn(pianoChan, pianoNote, 0)
            //piano chords off
            for (var note in chord) {
                seq.noteOn(pianoChan, note + bass[bassNote] + 48, 0)
            }
        }
        //control the range of piano notes
        if (pianoNote > 90) {
            pianoNote -= 12
        } else if (pianoNote < 60) {
            pianoNote += 12
        } else {
            pianoNote = pianoNote - 12 * random(2)
        }
    }
    return ctx;
}()
