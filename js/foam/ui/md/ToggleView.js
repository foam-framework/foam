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
  name: 'ToggleView',
  package: 'foam.ui.md',
  extends: 'foam.ui.SimpleView',

  traits: ['foam.ui.md.MDStyleTrait'],
  requires: ['foam.ui.md.HaloView'],

  properties: [
    {
      type: 'Boolean',
      name: 'data',
      view: 'foam.ui.BooleanView',
    },
    {
      type: 'Boolean',
      name: 'enabled',
      view: 'foam.ui.BooleanView',
      defaultValue: true,
    },
    {
      type: 'String',
      name: 'label',
      defaultValueFn: function() { return this.prop && this.prop.label; }
    },
    {
      name: 'className',
      defaultValue: 'toggle-container'
    },
    {
      name: 'halo',
      factory: function() {
        return this.HaloView.create({}, this.Y);
      }
    }
  ],
  templates: [
    function CSS() {/*
      .toggle-container {
        display: -webkit-flex;
        display: flex;
        align-items: center;
      }

      .toggle-label {
        flex-grow: 1;
        -webkit-flex-grow: 1;
        margin-top: auto;
        margin-bottom: auto;
      }

      .toggle-text-indicator {
        margin-right: 20px;
        width: 1em;
        margin-top: auto;
        margin-bottom: auto;
      }

      .toggle-outer {
        position: relative;
        width: 36px;
        height: 14px;
      }

      .toggle-halo {
        position: absolute;
        width: 48px;
        height: 48px;
        cursor: pointer;
        top: -17px;
        left: -6px;
      }

      .toggle-background {
        background-color: #9e9e9e;
        border-radius: 7px;
        display: inline-block;
        height: 14px;
        opacity: 0.3;
        position: absolute;
        width: 36px;
        pointer-events: none;
      }

      .toggle-background.enabled {
        opacity: 1.0;
      }

      .toggle-lever {
        background-color: #f5f5f5;
        border-radius: 50%;
        border: 1px solid #ccc;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.15);
        height: 20px;
        left: 0;
        position: absolute;
        top: -3px;
        transition: left .08s;
        width: 20px;
        pointer-events: none;
      }

      .toggle-background.toggledOn {
        background-color: #7baaf7;
      }

      .toggle-background.toggledOn .toggle-lever {
        border: none;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.26);
        background-color: #3367d6;
        left: inherit;
        left: 16px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <span class="toggle-label noselect md-grey"><%# this.label %></span>
        <span class="toggle-text-indicator noselect"><%# this.data ? "ON" : "OFF" %></span>
        <div class="toggle-outer noselect">
          <span id="<%=this.id%>-background" class="toggle-background">
            <div class="toggle-lever"></div>
          </span>
          <div class="toggle-halo noselect">
            <%= this.halo %>
          </div>
        </div>
      </div>
      <%
        this.on('click', this.onClick, this.id);
        this.setClass('toggledOn', function() { return !!self.data; },
            this.id + '-background');
        this.setClass('enabled', function() { return !!self.enabled; },
            this.id + '-background');
        this.setMDClasses();
      %>
    */}
  ],
  listeners: [
    function onClick(e) { this.enabled && (this.data = !this.data); }
  ]
});
