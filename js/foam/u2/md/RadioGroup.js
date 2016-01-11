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
  package: 'foam.u2.md',
  name: 'RadioGroup',
  extends: 'foam.u2.View',

  traits: ['foam.u2.ChoiceViewTrait'],

  requires: [
    'foam.ui.md.HaloView',
  ],
  imports: [
    'dynamic',
  ],

  documentation: function() {/*
    <p>A choice view that selects a single option from a list using Material
    Design radio buttons. The choice's value is in $$DOC{ref:".data"}, its label
    in $$DOC{ref:".text"}, like any $$DOC{ref:"foam.u2.ChoiceViewTrait"} view.
    </p>
  */},

  // TODO(braden): Enable user editing of an "other" choice, as in U1's
  // ChoiceRadioView.

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal',
      choices: [
        ['horizontal', 'Horizontal'],
        ['vertical', 'Vertical']
      ],
    },
    ['showLabel', false],
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls())
          .cls(this.dynamic(function() {
            return self.myCls(self.orientation);
          }, this.orientation$));

      for (var i = 0; i < this.choices.length; i++) {
        this.choiceElement(i);
      }
    },

    function makeHalo(index) {
      var h = this.HaloView.create({
        className: 'halo',
        recentering: false,
        pressedAlpha: 0.2,
        startAlpha: 0.2,
        finishAlpha: 0
      });
      Events.map(this.index$, h.color$, function(i) {
        return index === i ? '#5a5a5a' : '#4285f4';
      });
      return h;
    },

    // TODO(braden): Switch this for a template version when the parser is
    // working better. It was confused by the empty divs last time I tried it.
    function choiceElement(i) {
      var self = this;
      this.start('div').cls(this.myCls('choice-outer'))
          .cls(this.dynamic(function() {
            return self.index === i ? self.myCls('choice-selected') : '';
          }, this.data$))
          .on('click', function() { self.index = i; })
          .start('div').cls(this.myCls('choice-container'))
              .cls('noselect')
              .start('div').cls(this.myCls('choice-background'))
                  .start('div').cls(this.myCls('choice-indicator'))
                      .start('div').cls(this.myCls('choice-indicator-on')).end()
                      .start('div').cls(this.myCls('choice-indicator-off')).end()
                      .start('div').cls(this.myCls('choice-indicator-container'))
                          .add(this.makeHalo(i).toView_())
                          .end()
                      .end()
                  .start('div').cls(this.myCls('choice-label'))
                      .add(this.choices[i][1]).end()
              .end()
          .end()
      .end();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        display: flex;
        margin: 0 0 0 16px;
        padding: 0;
      }

      ^vertical {
        align-items: flex-start;
        flex-direction: column;
      }

      ^vertical ^choice-outer {
        display: block;
      }
      ^horizontal ^choice-outer {
        display: inline-block;
        margin-right: 16px;
      }

      ^choice-container {
        display: block;
        margin: 8px;
        padding: 8px;
        position: relative;
        white-space: nowrap;
      }

      ^choice-background {
        align-items: flex-end;
        display: flex;
        flex-direction: row;
        position: relative;
        white-space: nowrap;
      }

      ^choice-indicator {
        align-self: center;
        height: 16px;
        position: relative;
        width: 16px;
      }

      ^choice-indicator-off {
        border-color: #5a5a5a;
        border-radius: 50%;
        border: solid 2px;
        height: 16px;
        left: 0px;
        pointer-events: none;
        position: absolute;
        top: 0px;
        transition: border-color 0.28s;
        width: 16px;
      }
      ^choice-selected ^choice-indicator-off {
        border-color: #4285f4;
      }

      ^choice-indicator-on {
        background-color: #4285f4;
        border-radius: 50%;
        height: 8px;
        left: 4px;
        pointer-events: none;
        position: absolute;
        top: 4px;
        transform: scale(0);
        transition: transform ease 0.28s;
        width: 8px;
      }
      ^choice-selected ^choice-indicator-on {
        transform: scale(1);
      }

      ^choice-indicator-container {
        cursor: pointer;
        display: inline-block;
        height: 48px;
        left: -16px;
        position: absolute;
        top: -16px;
        vertical-align: middle;
        width: 48px;
      }
      ^choice-indicator-container .halo {
        border-radius: 50%;
      }

      ^choice-label {
        display: block;
        margin-left: 12px;
        pointer-events: none;
        position: relative;
        vertical-align: middle;
        white-space: nowrap;
      }
    */},
  ]
});
