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
  package: 'foam.ui.animated',
  name: 'Label',

  extends: 'foam.ui.SimpleView',

  imports: [ 'window' ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'alabel'
    },
    {
      name: 'left',
      postSet: function(_, l) {
        this.$.querySelector('.f1').style.left = l;
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      var tabIndex  = this.tabIndex ? ' tabindex="' + this.tabIndex + '"' : '';
      return '<div' + tabIndex + ' class="f1"></div><div class="f2"></div>';
    },
    initHTML: function() {
      this.data$.addListener(this.onDataChange);
      this.window.addEventListener('resize', this.onResize);
    }
  },

  templates: [
    function CSS() {/*
      .f1 {
        position: absolute;
        white-space: nowrap;
      }
      .f1.animated {
        transition: left .2s;
      }
      .f2 {
        display: inline;
        float: right;
        visibility: hidden;
        white-space: nowrap;
      }
    */}
  ],

  listeners: [
    {
      name: 'onDataChange',
      isFramed: true,
      code: function(_, __, oldValue, newValue) {
        if ( ! this.$ ) return;
        var f1$ = this.$.querySelector('.f1');
        var f2$ = this.$.querySelector('.f2');

        var data = this.data || '&nbsp;';
        f1$.innerHTML = data;
        f2$.innerHTML = data;

        f1$.style.left = f2$.offsetLeft;
        // Don't animate to the empty string, or prefix changes
        var animate = this.data.length && ( oldValue.startsWith(newValue) || newValue.startsWith(oldValue) );
        DOM.setClass(this.$.querySelector('.f1'), 'animated', animate);
      }
    },
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        DOM.setClass(this.$.querySelector('.f1'), 'animated', false);
        this.onDataChange();
      }
    }
  ]
});
