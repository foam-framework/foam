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
  package: 'foam.physics',
  name: 'PhysicsEngine',

  extendsModel: 'foam.physics.Collider',

  methods: [
    function updateChild(c) {
      var gravity = c.gravity;
      var friction = c.friction;
      
      if ( gravity ) c.vy += gravity;

      if ( friction ) {
        c.vx = Math.abs(c.vx) < 0.001 ? 0 : c.vx * friction;
        c.vy = Math.abs(c.vy) < 0.001 ? 0 : c.vy * friction;
      }

      // Inertia
      if ( Math.abs(c.vx) > 0.001 ) c.x += c.vx;
      if ( Math.abs(c.vy) > 0.001 ) c.y += c.vy;
    }
  ]
});

