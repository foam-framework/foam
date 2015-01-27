var AudioData = [];
aseq(
    arequire('foam.navigator.types.AudioSource'),
    arequire('foam.navigator.types.Audio')
    )(function(audioModel) {
      console.log('Audio model', audioModel);
      AudioData = JSONUtil.arrayToObjArray(X, [
        {
          // "model_": "foam.navigator.types.Audio",
          "id": "Audio:1",
          "lastModified": new Date('Mon Jan 26 2015 22:52:28 GMT-0500 (EST)'),
          "labels": [
            "last.fm"
          ],
          "title": "Flow",
          "creator": "Uppermost",
          "collection": "last.fm Samples",
          "audioData": {
            "model_": "foam.navigator.types.AudioSource",
            "src": "http://freedownloads.last.fm/download/626522452/Flow.mp3"
          }
        }
      ], audioModel);
    });
