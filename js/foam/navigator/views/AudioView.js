/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'AudioView',
  package: 'foam.navigator.views',
  extends: 'foam.ui.DetailView',

  imports: [
    'PropertyView',
    'document'
  ],

  properties: [
    {
      name: 'data',
      required: true
    },
    {
      type: 'Boolean',
      name: 'defaultControls',
      defaultValue: true
    },
    {
      name: 'sourceCollection',
      dynamicValue: function() {
        return this.data && [this.data.audioData];
      }
    },
    {
      type: 'Boolean',
      name: 'playing',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'playImgURL',
      defaultValue: 'images/play.png'
    },
    {
      type: 'String',
      name: 'pauseImgURL',
      defaultValue: 'images/pause.png'
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        var play = this.playElement();
        var pause = this.pauseElement();
        if ( play && pause && ! this.defaultControls ) {
          play.addEventListener('click', this.onPlayPause);
          pause.addEventListener('click', this.onPlayPause);
        }
      }
    },
    {
      name: 'audioElement',
      code: function() {
        return this.document.getElementById(this.id + '-audio');
      }
    },
    {
      name: 'playElement',
      code: function() {
        return this.document.getElementById(this.id + '-play');
      }
    },
    {
      name: 'pauseElement',
      code: function() {
        return this.document.getElementById(this.id + '-pause');
      }
    }
  ],

  listeners: [
    {
      name: 'onPlayPause',
      code: function() {
        var audio = this.audioElement();
        var play = this.playElement();
        var pause = this.pauseElement();
        if ( ! play || ! pause || ! audio ) return;
        if ( this.playing ) {
          pause.className = 'hide';
          play.className = '';
          audio.pause();
          this.playing = false;
        } else {
          play.className = 'hide';
          pause.className = '';
          audio.play();
          this.playing = true;
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <audio id="{{{this.id}}}-audio" preload="none" <% if ( this.defaultControls ) { %>controls<% } %> >
      <% for ( var i = 0; i < this.sourceCollection.length; ++i ) {
        var src = this.sourceCollection[i]; %>
        <source src="{{{src.src}}}" type="{{{src.type}}}"></source>
      <% } %>
      </audio>
      <% if ( ! this.defaultControls ) { %>
        <img id="{{{this.id}}}-play" src="{{{this.playImgURL}}}" class=""></img>
        <img id="{{{this.id}}}-pause" src="{{{this.pauseImgURL}}}" class="hide"></img>
      <% } %>
    */},
    function CSS() {/*
      img.hide { display: none; }

    */}
  ]
});
