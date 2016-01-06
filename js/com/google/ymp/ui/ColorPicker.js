/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.ymp.ui',
  name: 'ColorPicker',

  imports: [ 'document' ],

  properties: [
    {
      name: 'colors',
      lazyFactory: function() {
        return [
          { r: 0, g: 0, b: 0 },
          { r: 255, g: 0, b: 0 },
          { r: 0, g: 255, b: 0 },
          { r: 0, g: 0, b: 255 },
          { r: 255, g: 255, b: 0 },
          { r: 255, g: 0, b: 255 },
          { r: 0, g: 255, b: 255 },
          { r: 255, g: 255, b: 255 },
        ];
      },
    },
    {
      type: 'Int',
      name: 'blockSize',
      defaultValue: 90,
    },
    {
      type: 'Float',
      name: 'precision',
      defaultValue: 10,
    },
    {
      name: 'canvas',
      lazyFactory: function() { return this.document.createElement('canvas'); },
    },
    {
      name: 'ctx',
      lazyFactory: function() { return this.canvas.getContext('2d'); },
    },
  ],

  methods: [
    function pickColorFromUrl(ret, url) {
      var e = this.document.createElement('img');
      e.src = url;
      this.pickColorFromE(ret, e);
    },
    function pickColorFromStr(ret, str) {
      var votes = {}, len = str.length;
      for ( var i = 0; i < str.length; ++i ) {
        this.castVote(votes, str.charCodeAt(i),
                      str.charCodeAt((i + 1) % len),
                      str.charCodeAt((i + 1) % len));
      }
      ret(this.pickPaletteColor(this.extractWinner(votes)));
    },
    function sampleImage(data, f) {
      var length = data.data.length;

      for ( var i = 0; i < length; i += this.blockSize * 4 ) {
        f(data.data[i], data.data[i+1], data.data[i+2]);
      }
    },
    function castVote(votes, r, g, b) {
      var key = 'rgb(' + this.round(r) + ',' +
          this.round(g) + ',' +this.round(b) + ')';
      votes[key] = (votes[key] || 0) + 1;
    },
    function round(v) {
      return Math.round((v % this.precision) * (255 / (this.precision - 1)));
    },
    function extractWinner(votes) {
      var winner = 0, winnerIdx = 0;
      Object_forEach(votes, function(value, key) {
        if ( value > winner ) {
          winner = value;
          winnerIdx = key;
        }
      });
      return winnerIdx;
    },
    function pickPaletteColor(key) {
      // TODO(markdittmer): Too much over-and-back with string and number reps?
      var groups = /^rgb\(([0-9]*),([0-9]*),([0-9]*)\)$/.exec(key);
      var r = parseInt(groups[1]), g = parseInt(groups[2]), b = parseInt(groups[3]);
      var dists = this.colors.map(function(color) {
        return Math.abs(r - color.r) +
            Math.abs(g - color.g) +
            Math.abs(b - color.b);
      });
      var winner = Number.POSITIVE_INFINITY, winnerIdx = 0;
      for ( var i = 0; i < dists.length; ++i ) {
        if ( dists[i] < winner ) {
          winner = dists[i];
          winnerIdx = i;
        }
      }
      var color = this.colors[winnerIdx];
      return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
    },
  ],

  listeners: [
    {
      name: 'pickColorFromE',
      isMerged: 150,
      code: function(ret, e) {
        var data, width, height,
            votes = {};
        height = this.canvas.height = e.naturalHeight || e.offsetHeight || e.height;
        width = this.canvas.width = e.naturalWidth || e.offsetWidth || e.width;

        this.ctx.drawImage(e, 0, 0);

        data = this.ctx.getImageData(0, 0, width, height);

        this.sampleImage(data,
                         this.castVote.bind(this, votes));

        ret(this.extractWinner(votes));
      },
    },
  ],
});
