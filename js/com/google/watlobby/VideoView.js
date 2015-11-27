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
  name: 'VideoView',
  extends: 'foam.ui.SimpleView',
  properties: [
    {
      name: 'src',
      adapt: function(_, s) {
        if ( ! s.startsWith('http') ) {
          return 'https://www.youtube.com/embed/' + s + '?autoplay=1';
        }
        return s;
      }
    },
    'width',
    'height'
  ],
  methods: [
    function start() {
      if ( this.$ ) {
        this.$.innerHTML = this.makeIframe();
      }
    },
    function stop() {
      this.$.innerHTML = '';
    }
  ],
  templates: [
    function toHTML() {/*<div id="%%id" style="background:black;width:<%= this.width %>px;height:<%= this.height %>px;"></div>*/},
    function makeIframe() {/*<iframe width="%%width" height="%%height" src="%%src" frameborder="0" allowfullscreen></iframe>*/}
  ]
});
