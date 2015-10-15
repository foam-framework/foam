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
  package: 'foam.ui.navigation',
  name: 'TopToolbar',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.ViewFactoryView',
  ],
  properties: [
    {
      name: 'label',
    },
    {
      name: 'leftActionView',
    },
    {
      name: 'extraView',
      postSet: function(_, v) {
        if (v) { this.extraViewInstance_ = v(); }
      }
    },
    {
      name: 'extraViewInstance_',
      postSet: function(o, v) {
        if ( o ) o.removePropertyListener('preferredHeight', this.onResize);

        this.preferredHeight +=
            (v ? (v.preferredHeight || 0) : 0) -
            (o ? (o.preferredHeight || 0) : 0);

        if ( v ) v.addPropertyListener('preferredHeight', this.onResize);
      }
    },
    {
      name: 'extraViewFactory_',
      factory: function() {
        var view = this.ViewFactoryView.create();
        Events.map(this.extraViewInstance_$, view.data$,
            function(v) { return function() { return v; } });
        return view;
      },
    },
    {
      name: 'preferredHeight',
      defaultValue: 67,
      postSet: function() { this.resize(); },
    },
    {
      name: 'className',
      defaultValue: 'TopToolbarView-container',
    },
  ],
  listeners: [
    {
      name: 'onResize',
      code: function(_, __, old, nu) {
        this.preferredHeight += nu - old;
      }
    }
  ],
  methods: {
    resize: function() {
      if (this.$) {
        this.$.style.height = this.preferredHeight + 'px';
      }
    },
    initHTML: function() {
      this.SUPER();
      this.preferredHeight =
          document.getElementById(this.id + '-container').clientHeight;
    },
  },
  templates: [
  function CSS() {/*
    .TopToolbarView-container {
      -webkit-align-self: center;
      -webkit-transform: translate3d(0px, 0px, 1px);
      align-self: center;
      background-color: #36474F;
      box-shadow: 0 0 4px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.28);
      overflow: hidden;
      transition: height 0.3s;
      width: 100%;
    }
    .TopToolbarView-container .label {
      -webkit-align-self: center;
      color: white;
      display: inline-block;
      font-size: 20px;
      margin-left: 16px;
      overflow-x: hidden;
      padding: 10px 0;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .TopToolbarView-container .top {
      padding: 10px 0;
    }
    .TopToolbarView-container .leftAction {
      float: left;
    }
  */},
  function toHTML() {/*
    <div id="%%id" <%= this.cssClassAttr() %>>
      <div id="%%id-container">
        <div class='top'>
          <span class='leftAction'>%%leftActionView</span>
          <span class='label'><%# this.label %>&#8193;</span>
        </div>
        %%extraViewFactory_
      </div>
    </div>
  */},
  ]
});
