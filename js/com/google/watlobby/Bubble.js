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
  name: 'Bubble',

  extends: 'foam.demos.physics.PhysicalCircle',

  imports: [
    'document'
  ],

  properties: [
    { name: 'x', preSet: function(_, x) { return Math.floor(x); } },
    { name: 'y', preSet: function(_, y) { return Math.floor(y); } },
    { name: 'borderWidth', defaultValue: 20 },
    { name: 'color',       defaultValue: 'white' },
    { name: 'snapshot' },
    ['zoom', 0],
    { name: 'snapshotting', type: 'Boolean', defaultValue: false }
  ],

  methods: [
    function atRest() {
      return this.zoom == 0 &&
        this.alpha == 1 &&
        this.scaleX == 1 &&
        this.scaleY == 1;
    },

    function paint(c) {
      if ( this.atRest() ) {
        if ( ! this.snapshot ) {
          var snapshot = this.document.createElement('canvas');
          snapshot.width = this.width;
          snapshot.height = this.height;

          var tmp = snapshot.getContext('2d');

          var oldX = this.x;
          var oldY = this.y;

          this.x = this.r + this.borderWidth;
          this.y = this.r + this.borderWidth;

          this.SUPER(tmp);

          this.x = oldX;
          this.y = oldY;

          this.snapshot = snapshot;
        }

        c.save();
        this.transform(c);
        var offset = Math.floor(this.r + this.borderWidth);
        c.drawImage(this.snapshot, -offset, -offset);
        c.restore();
        return;
      }
      this.SUPER(c);
    }
  ]
});
