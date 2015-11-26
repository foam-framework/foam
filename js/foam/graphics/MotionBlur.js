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
  package: 'foam.graphics',
  name: 'MotionBlur',
  methods: {
    paint: function(c) {
      this.SUPER(c);
      var oldAlpha = this.alpha;

      c.save();
      c.translate(-this.vx, -this.vy);
      this.alpha = 0.6;
      this.SUPER(c);
      c.translate(-this.vx, -this.vy);
      this.alpha = 0.3;
      this.SUPER(c);
      c.restore();

      this.alpha = oldAlpha;
    }
  }
});
