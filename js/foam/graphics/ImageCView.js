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
  name: 'ImageCView',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'src',
      label: 'Source'
    },
    ['width',  -1],
    ['height', -1]
  ],

  methods: {
    initCView: function() {
      this.SUPER();
      this.image_ = new Image();
      this.image_.onload = function() {
        if ( this.width  == -1 ) this.width  = this.image_.width;
        if ( this.height == -1 ) this.height = this.image_.height;
        this.view.paint();
      }.bind(this);
      this.image_.src = this.src;
      this.view.paint();
    },

    transform: function(c) {
      if ( this.width && this.image_.width )
        this.scaleX = this.width / this.image_.width;
      if ( this.height && this.image_.height )
        this.scaleY = this.height / this.image_.height;

      this.SUPER(c);
    },

    paintSelf: function(c) {
      c.drawImage(this.image_, 0, 0);
    }
  }
});
