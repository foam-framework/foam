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
  package: 'com.google.paper',
  name: 'VideoCaptureView',

  extends: 'foam.ui.SimpleView',

  properties: [
    {
      name: '$canvas',
      getter: function() { return this.X.$(this.id + '-canvas'); },
    },
    {
      name: '$video',
      getter: function() { return this.X.$(this.id + '-video'); },
    }
    
    
  ],

  methods: [
    function initHTML() {
      var nav = this.X.navigator;
      var umFn = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia;      
      if ( ! umFn ) {
        this.onVideoError();
      } else {
        umFn.call(nav, 
          { audio: false, video: true }, 
          this.onVideoReady, 
          this.onVideoError
        );
      }
    },
    function capture() {
      var context = this.$canvas.getContext('2d');
      var w = this.$video.clientWidth;
      var h = this.$video.clientHeight;
      this.$canvas.width = w;
      this.$canvas.height = h;
      context.drawImage(this.$video, 0, 0, w, h);

      this.data = this.$canvas.toDataURL('image/png');
    }
  ],
  
  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %> >
        <canvas id="<%= this.id + '-canvas' %>" style="display:none"></canvas>
        <video id="<%= this.id + '-video' %>"></video>
      </div>
    */}
  ],
  
  listeners: [
    {
      name: 'onVideoReady',
      code: function(stream) {
        if ( ! this.$ ) return;
        var vendorURL = window.URL || window.webkitURL;
        this.$video.src = vendorURL.createObjectURL(stream);
        this.$video.play();
        
        this.X.setInterval(this.pollCapture, 500);
      }
    },
    {
      name: 'onVideoError',
      code: function(streamError) {
        console.warn("Media Error: ", streamError);
      }
    },    
    {
      name: 'pollCapture',
      code: function() {
        this.capture();
      }
    }
  ]
});