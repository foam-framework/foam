/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.md',
  name: 'DateTimeField',
  extends: 'foam.u2.md.DateField',
  requires: [
    'foam.u2.md.TimePicker',
  ],

  constants: {
    CSS_CLASS: 'foam-u2-md-DateField',
  },

  properties: [
    'timePicker_',
  ],

  methods: [
    function inputE() {
      this.SUPER();
      var input = this.start('span')
          .cls(this.myCls('inner'))
          .on('click', this.onTimeClick);

      input.add(this.dynamic(function(data) {
        return data ? data.toLocaleTimeString() : '--';
      }.bind(this), this.realData$));

      input.style({ 'margin-left': '12px' });

      input.end();
    },
  ],

  listeners: [
    function onTimeClick() {
      // Make sure to blur the active element, whatever it is.
      // Hides the keyboard on mobile.
      var active = this.document.activeElement;
      if (active) active.blur();

      this.timePicker_ = this.TimePicker.create({ data$: this.realData$ });
      this.dialog_ = this.EasyDialog.create({
        title: this.timePicker_.titleE,
        body: this.timePicker_.bodyE,
        padding: false,
        onConfirm: function() {
          this.timePicker_.onOK();
          this.data = this.timePicker_.data;
          this.timePicker_ = null;
          this.dialog_ = null;
        }.bind(this)
      });
      this.dialog_.open();
    },
  ],
});
