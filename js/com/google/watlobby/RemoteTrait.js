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
  package: 'com.google.watlobby',
  name: 'RemoteTrait',

  constants: {
    BACK_TOPIC: '*back*'
  },

  properties: [
    {
      name: 'root',
      defaultValue: '',
      postSet: function(_, n) { this.symRoot = n; }
    },
    {
      name: 'symRoot',
      defaultValue: '',
      postSet: function(_, n) { this.dir = n; }
    },
    {
      name: 'dir',
      defaultValue: ''
    },
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o === n || !n ) return;

        this.topics.find(EQ(this.Topic.PARENT_TOPIC, n), {
          put: function() {
            this.dir = n;
          }.bind(this)
        });
      }
    }
  ],

  listeners: [
    function onClick(evt) {
      var t = this.findChildAt(evt.clientX, evt.clientY);
      if ( t && t.topic ) {
        if ( t.topic.topic === this.BACK_TOPIC ) {
          this.selected = '';
          this.back();
        } else if ( t.topic.topic === this.selected ) {
          this.selected = '';
        } else {
          this.selected = t && t.topic && t.topic.topic;
        }
      } else {
        if ( this.selected ) {
          this.selected = null;
        } else if ( this.dir ) {
          this.back();
        }
      }
    }
  ],

  methods: [
    function maybeRedirect(t) {
      if ( t.topic === this.root && t.model === 'Redirect' ) {
        this.symRoot = t.redirect;
        return true;
      }
      return false;
    },
    function findTopicIndex(t) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        if ( c.topic && c.topic.topic === t ) return i;
      }
      return -1;
    },
    function findTopic(t) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        if ( c.topic && c.topic.topic === t ) return c;
      }
    },
    function back() {
      var self = this;
      if ( this.dir === this.symRoot ) return;
      // CD up a directory
      this.topics.find(EQ(this.Topic.TOPIC, this.dir), {
        put: function(t) { self.dir = t.parentTopic; },
        error: function() { self.dir = ''; }
      });
    }
  ]
});
