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

  properties: [
    { name: 'root', defaultValue: '' },
    {
      name: 'dir',
      defaultValue: ''
    },
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o === n || !n ) return;

        this.topics.find(EQ(this.Topic.PARENT, n), {
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
      if ( t ) {
        this.selected = t && t.topic && t.topic.topic;
      } else {
        if ( this.selected ) {
          this.selected = null;
        } else if ( this.dir ) {
          var self = this;
          // CD up a directory
          this.topics.find(EQ(this.Topic.TOPIC, this.dir), {
            put: function(t) { self.dir = t.parent; },
            error: function() { self.dir = ''; }
          });
        }
      }
    }
  ]
});