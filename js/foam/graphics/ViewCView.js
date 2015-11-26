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
  package: 'foam.graphics',
  name: 'ViewCView',

  extends: 'foam.graphics.CView',

  help: "View to CView adapter. Let's you display Views in a CView.",

  properties: [ 'innerView' ],

  methods: [
    function element() {
      if ( ! this.e_ ) {
        var div = document.createElement('div');
        document.body.appendChild(div);
        div.innerHTML = this.innerView.toHTML();
        this.innerView.initHTML();
        this.e_ = div;
      }
      return this.e_;
    },
    function paintSelf(canvas) {
      var e = this.element();
      e.style.opacity = this.alpha;
      // e.style.background = this.background;
      e.style.top = 0;
      e.style.position = 'absolute';
      e.style.overflow = 'hidden';
      e.style.width = this.width;
      e.style.height = this.height;
      var x = this.parent.x + this.x;
      var y = this.parent.y + this.y;
      e.style.webkitTransform = 'translate3d(' + x + 'px,' + y + 'px,0)'
    },
    function destroy() {
      this.SUPER();

      if ( this.e_ ) {
        this.e_.remove();
      }
    }
  ]
});
