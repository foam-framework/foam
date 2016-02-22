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
  name: 'CheckboxView',
  package: 'foam.ui.md',
  extends: 'foam.ui.SimpleView',

  requires: ['foam.ui.md.HaloView'],
  traits: ['foam.ui.md.MDStyleTrait'],

  properties: [
    {
      name: 'data',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'mode',
      defaultValue: 'read-write',
      choices: ['read-write', 'read-only', 'final']
    },
    {
      name: 'enabled',
      type: 'Boolean',
      view: 'foam.ui.BooleanView',
      defaultValue: true,
    },
    {
      name: 'prop',
    },
    {
      name: 'label',
      type: 'String',
      defaultValueFn: function() { return this.prop && this.prop.label; }
    },
    {
      name: 'className',
      defaultValue: 'checkbox-container'
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'checkboxPosition',
      defaultValue: 'right',
      choices: ['right', 'left']
    },
    {
      name: 'halo',
      factory: function() {
        return this.HaloView.create({}, this.Y);
      }
    },
    {
      type: 'Boolean',
      name: 'showBorder',
      defaultValue: false,
    }
  ],
  templates: [
    function CSS() {/*
      .checkbox-container {
        display: flex;
        align-items: center;
      }

      .checkbox-label {
        flex-grow: 1;
        margin-right: 12px;
      }

      .checkbox-data-outer {
        position: relative;
        width: 18px;
        height: 18px;
      }

      .checkbox-halo {
        position: absolute;
        width: 48px;
        height: 48px;
        top: -15px;
        left: -15px;
        cursor: pointer;
      }

      .checkbox-data-container {
        border-radius: 2px;
        border: solid 2px #5a5a5a;
        box-sizing: border-box;
        display: inline-block;
        pointer-events: none;
        position: absolute;
        transition: background-color 140ms, border-color 140ms;
        opacity: 0.3;
        fill: rgba(0,0,0,0);
      }

      .checkbox-container.left {
        flex-direction: row-reverse;
      }

      .checkbox-container.left .checkbox-label {
        margin-left: 12px;
        margin-right: initial;
      }

      .checkbox-container.enabled .checkbox-data-container {
        opacity: 1.0;
      }

      .checkbox-container.checked .checkbox-data-container {
        background-color: #04A9F4;
        border-color: #04A9F4;
        fill: white;
      }

      .checkbox-label-ro {
        margin-left: 10px;
      }

      .checkbox-container.left .checkbox-label-ro {
        margin-left: 10px;
        margin-right: initial;
      }

      .checkbox-data {
        width: 18px;
        height: 18px;
      }

      .checkbox-data.ro {
        fill: #9e9e9e;
        visibility: hidden;
      }
      .checked .checkbox-data.ro {
        visibility: visible;
      }
      .checkbox-data.border {
        border: solid 2px #5a5a5a;
      }
    */},

    function checkIcon() {/*
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path d="M0 0h48v48H0z" fill="none"/>
        <path d="M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z"/>
      </svg>
    */},

    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %> >

      <% if (this.mode === 'read-only') { %>
          <div id="<%= this.id %>-border" class="checkbox-data border">
            <div class="checkbox-data ro">
              <%= this.checkIcon() %>
            </div>
          </div>
          <div class="checkbox-label-ro"><%= this.label %></div>
      <%  this.setClass('border', function() {
            return this.showBorder;
          },this.id+'-border');

          } else { %>
          <span class="checkbox-label noselect md-grey"><%# this.label %></span>
          <div class="checkbox-data-outer noselect">
            <div class="checkbox-data-container checkbox-data">
              <%= this.checkIcon() %>
            </div>
            <div class="checkbox-halo noselect"><%= this.halo %></div>
          </div>
        <%
          this.on('click', function() {
            if (self.enabled) {
              self.data = !self.data;
            }
          }, this.id);
          this.setClass('enabled', function() { return !!self.enabled; },
              this.id);
        %>
      <% } %>
      <% this.setClass('checked', function() { return !!self.data; },
             this.id);
         this.setClass('left', function() {
           return this.checkboxPosition === 'left';
         },this.id);
         %>

      </div>

      <% this.setMDClasses(); %>
    */}
  ]
});
