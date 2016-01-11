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
  package: 'foam.patterns.layout',
  name: 'LayoutItemLinearConstraintsProxy',
  extends: 'foam.patterns.layout.LayoutItemLinearConstraints',

  documentation: function() {/* The information layout items provide for a
                            single axis of linear layout. */},

  properties: [
    {
      name: 'data',
      // type: 'foam.patterns.layout.LayoutItemLinearConstraints',
      preSet: function(old,nu) {
        if (old) {
          this.unbind(old);
        }
        return nu;
      },
      postSet: function() {
        this.bind(this.data);
      }
    }
  ],

  methods: {
    setTotalSize: function(size) {
      if (this.data) {
        this.data.setTotalSize(size);
      }
    },
    bind: function(nu) {
      Events.follow(nu.preferred$Pix$, this.preferred$);
      Events.follow(nu.max$Pix$, this.max$);
      Events.follow(nu.min$Pix$, this.min$);
      Events.follow(nu.stretchFactor$, this.stretchFactor$);
      Events.follow(nu.shrinkFactor$, this.shrinkFactor$);
    },
    unbind: function(old) {
      Events.unfollow(old.preferred$Pix$, this.preferred$);
      Events.unfollow(old.max$Pix$, this.max$);
      Events.unfollow(old.min$Pix$, this.min$);
      Events.unfollow(old.stretchFactor$, this.stretchFactor$);
      Events.unfollow(old.shrinkFactor$, this.shrinkFactor$);
    }
  }

});
