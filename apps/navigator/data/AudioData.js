var AudioData = [];
aseq(
    arequire('foam.navigator.types.AudioSource'),
    arequire('foam.navigator.types.Audio')
    )(function(audioModel) {
      var audioID = 0;
      AudioData = JSONUtil.arrayToObjArray(X, [
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Flow",
          "creator": "Uppermost",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/626522452/Flow.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/93953917.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Cold as hell",
          "creator": "DZA",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/402053271/Cold%2Bas%2Bhell.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/71240586.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Betrayer of Divinity",
          "creator": "Moshing Samurai",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/333379574/Betrayer%2BOf%2BDivinity.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/47957157.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Morning Light",
          "creator": "Akamushi",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/433759890/Morning%2Blight.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/54800601.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "The Trial",
          "creator": "The Grassy Knoll",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/14020833/The%2BTrial.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/41864077.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Reflection",
          "creator": "Lo-Fye",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/724845721/Reflection.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/99594299.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Coffee",
          "creator": "My Parents Favorite Music",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/74150248/Coffee.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/70221102.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Falling in Love",
          "creator": "Kamei",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/381781846/Falling%2Bin%2BLove.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/89279365.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Lumino",
          "creator": "Recue",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/50863166/Lumino.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/43098567.jpg"
        },
        {
          // model_: "foam.navigator.types.Audio",
          "id": "Audio:" + (++audioID),
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "doG gave us a mission",
          "creator": "Muzik 4 Machines",
          "collection": "last.fm Samples",
          "audioData": {
            model_: "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/134280631/doG%2Bgave%2Bus%2Ba%2Bmission.mp3"
          },
          "iconURL": "http://userserve-ak.last.fm/serve/64s/20303191.jpg"
        }
      ], audioModel);
    });
