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
  package: 'foam.ui',
  name: 'ImageView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'className',
      defaultValue: 'imageView'
    },
    {
      name: 'backupImage'
    },
    {
      name: 'domValue',
      postSet: function(oldValue, newValue) {
        oldValue && Events.unfollow(this.data$, oldValue);
        newValue && Events.follow(this.data$, newValue);
      }
    },
    {
      name: 'displayWidth',
      postSet: function(_, newValue) {
        if ( this.$ ) this.$.style.width = newValue;
      }
    },
    {
      name: 'displayHeight',
      postSet: function(_, newValue) {
        if ( this.$ ) this.$.style.height = newValue;
      }
    },
    {
      name: 'alpha',
      defaultValue: 1.0,
      postSet: function(_, newValue) {
        if ( this.$ ) this.$.style.opacity = newValue;
      }
    }
  ],

  methods: {
    toHTML: function() {
      var src = ( window.IS_CHROME_APP && ! this.isSupportedUrl(this.data) ) ?
        ( this.backupImage ? ' src="' + this.backupImage + '"' : '' ) :
        ' src="' + this.data + '"';

      return '<img ' + this.cssClassAttr() + ' id="' + this.id + '"' + src +
          'style="opacity:' + this.alpha + '">';
    },
    isSupportedUrl: function(url) {
      url = url.trim().toLowerCase();
      return url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('filesystem:');
    },
    initHTML: function() {
      this.SUPER();

      if ( this.backupImage ) this.$.addEventListener('error', function() {
        this.data = this.backupImage;
      }.bind(this));

      if ( window.IS_CHROME_APP && ! this.isSupportedUrl(this.data) ) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.data);
        xhr.responseType = 'blob';
        xhr.asend(function(blob) {
          if ( blob ) self.$.src = URL.createObjectURL(blob);
        });
      } else {
        this.domValue = DomValue.create(this.$, undefined, 'src');
        this.displayHeight = this.displayHeight;
        this.displayWidth = this.displayWidth;
      }
    }
  }
});
