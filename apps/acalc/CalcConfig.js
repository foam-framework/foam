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

// HACK: The buttons don't draw using the Roboto font because it isn't loaded yet.
// So we wait a second, to give the font time to load, then redraw all the buttons.
// TODO: Something better.
CLASS({
  name: 'ActionButtonCView2',
  extendsModel: 'foam.graphics.ActionButtonCView',
  methods: {
    init: function() {
      this.SUPER();
      setTimeout(function() { this.view.paint(); }.bind(this), 1000);
    },
    toView_: function() {
      var v = this.SUPER();
      return v.decorate('toHTML', function(SUPER) { return '<div class="button">' + SUPER.call(this) + '</div>';}, v.toHTML);
    }
  }
});

getCalcButton = function() {
  return ActionButtonCView2.xbind({
    color:      'white',
    background: '#4b4b4b',
    width:      60,
    height:     60,
    font:       '300 28px RobotoDraft',
    role:       'button'
  });
};
