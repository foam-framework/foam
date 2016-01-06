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
  package: 'foam.u2',
  name: 'ActionButton',
  extends: 'foam.u2.Element',

  imports: [ 'data', 'dynamic' ],

  properties: [
    'action',
    [ 'nodeName', 'button' ],
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'label',
      defaultValueFn: function() {
        return this.data ?
            this.action.labelFn.call(this.data, this.action) :
            this.action.label ;
      }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        -webkit-box-shadow: inset 0 1px 0 0 #ffffff;
        box-shadow: inset 0 1px 0 0 #ffffff;
        background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
        background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% );
        background-color: #ededed;
        -moz-border-radius: 3px;
        -webkit-border-radius: 3px;
        border-radius: 3px;
        border: 1px solid #dcdcdc;
        display: inline-block;
        color: #777777;
        font-family: arial;
        font-size: 12px;
        font-weight: bold;
        margin: 2px;
        padding: 4px 16px;
        text-decoration: none;
        visibility: hidden;
      }

      ^available {
        visibility: visible;
      }

      ^:hover {
        background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) );
        background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% );
        background-color: #dfdfdf;
      }

      ^ img {
        vertical-align: middle;
      }

      ^:disabled { color: #bbb; -webkit-filter: grayscale(0.8); }
    */}
  ],

  methods: [
    function initE() {
      var self = this;
      this.
        cls(this.myCls()).
        cls(this.myCls('available'), function() {
          return self.action.isAvailable.call(self.data, self.action);
        }).
        on('click', function() { self.action.maybeCall(self.X, self.data); }).
        attrs({disabled: function() {
          return self.action.isEnabled.call(self.data, self.action) ? undefined : 'disabled';
        }}).
        add(this.iconUrl && this.Image.create({src: this.iconUrl})).
        add(this.showLabel && this.dynamic(function() { return self.label; }, this.data$, this.label$));
    }
  ]
});
