/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.physics',
  name: 'Physical',

  constants: {
    INFINITE_MASS: 10000
  },

  properties: [
    { type: 'Float', name: 'vx', defaultValue: 0 },
    { type: 'Float', name: 'vy', defaultValue: 0 },
    {
      type: 'Float',
      name: 'velocity',
      getter: function() { return Movement.distance(this.vx, this.vy); },
      setter: function(v) { this.setVelocityAndAngle(v, this.angleOfVelocity); }
    },
    {
      type: 'Float',
      name: 'angleOfVelocity',
      getter: function() { return Math.atan2(this.vy, this.vx); },
      setter: function(a) { this.setVelocityAndAngle(this.velocity, a); }
    },
    { type: 'Float', name: 'mass', defaultValue: 1 }
  ],

  methods: {
    applyMomentum: function(m, a) {
      this.vx += (m * Math.cos(a) / this.mass);
      this.vy += (m * Math.sin(a) / this.mass);
    },
    momentumAtAngle: function(a) {
      if ( this.mass == this.INFINITE_MASS ) return 0;
      var v = this.velocityAtAngle(a);
      return v * this.mass;
    },
    velocityAtAngle: function(a) {
      if ( this.mass == this.INFINITE_MASS ) return 0;
      return Math.cos(a-this.angleOfVelocity) * this.velocity;
    },
    setVelocityAndAngle: function(v, a) {
      this.vx = v * Math.cos(a);
      this.vy = v * Math.sin(a);
    },
    distanceTo: function(other) {
      return Movement.distance(this.x-other.x, this.y-other.y);
    }
  }
});
