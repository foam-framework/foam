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
  name: 'TooltipDemo',
  package: 'foam.ui.polymer.demo',
  extends: 'foam.ui.View',
  requires: [
    'foam.ui.polymer.demo.ElementWithTooltip',
    'foam.ui.polymer.Tooltip'
  ],

  properties: [
    {
      type: 'String',
      name: 'right',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Right'
    },
    {
      type: 'String',
      name: 'top',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Top'
    },
    {
      type: 'String',
      name: 'left',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Left'
    },
    {
      type: 'String',
      name: 'bottom',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Bottom'
    },
    {
      type: 'String',
      name: 'noArrow',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'NoArrow'
    },
    {
      type: 'String',
      name: 'richText',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'RichText'
    },
    {
      type: 'String',
      name: 'show',
      view: 'foam.ui.polymer.demo.ElementWithTooltip',
      defaultValue: 'Show'
    }
  ],

  templates: [
    function toHTML() {/*
      <div class="centeredDiv">
        $$top{ tooltipConfig: {
          text: 'Tooltip on the top',
          position: 'top'
        } }
      </div><div class="centeredDiv">
        $$left{ tooltipConfig: {
          text: 'Tooltip on the left',
          position: 'left'
        } }
      </div><div class="centeredDiv">
        $$right{ tooltipConfig: {
          text: 'Tooltip on the right',
          position: 'right'
        } }
      </div><div class="centeredDiv">
        $$bottom{ tooltipConfig: {
          text: 'Tooltip on the bottom',
          position: 'bottom'
        } }
      </div><div class="centeredDiv">
        $$noArrow{ tooltipConfig: {
          text: 'Tooltip without arrow',
          noarrow: true
        } }
      </div><div class="centeredDiv">
        $$richText{ tooltipConfig: {
          html: 'Tooltip with <b>rich</b> <i>text</i>'
        } }
      </div><div class="centeredDiv">
        $$show{ tooltipConfig: {
          text: 'Tooltip always shown',
          show: true
        } }
      </div>
    */},
    function CSS() {/*
      .centeredDiv { cursor: pointer; width: 0; margin: 0 auto; }
    */}
  ]
});
