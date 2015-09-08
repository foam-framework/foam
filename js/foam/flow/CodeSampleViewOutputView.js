/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'CodeSampleViewOutputView',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  requires: [ 'foam.ui.ActionButton' ],
  imports: [ 'sampleCodeContext$' ],

  constants: { ELEMENT_NAME: 'view-output' },

  properties: [
    {
      name: 'sampleCodeContext'
    },
    {
      model_: 'StringProperty',
      name: 'data'
    },
    {
      name: 'height',
      defaultValue: 200
    },
    {
      name: 'cssHeight',
      documentation: 'Height as string: "#px" for CSS style="..." override',
      dynamicValue: function() {
        this.data && this.data.view; this.height;
        return (this.data && this.data.view) ? this.height + 'px' : '';
      }
    },
    {
      name: 'cssClassName',
      documentation: 'Dynamically computed CSS class name',
      dynamicValue: function() {
        this.data && this.data.view; this.height;
        return this.data && this.data.view && this.height > 0 ? 'visible' : '';
      }
    },
    {
      name: 'state',
      documentation: function() {/* Either "hold" or "release". Used to control
        accumulation of updates (hold state), and showing of updates (release
        state). */},
      defaultValue: 'release',
      postSet: function(old, nu) { this.prevState = old; }
    },
    {
      name: 'prevState',
      documentation: 'Previous $$DOC{.state}. Used to dedup state updates',
      defaultValue: 'release'
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);

        Events.dynamic(function() {
          this.data && this.data.view; this.$; this.state;
          if ( ! this.$ || ! this.data || this.state !== 'release' ||
              this.prevState === this.state ) return;
          this.updateHTML();
        }.bind(this));
        Events.dynamic(function() {
          this.height; this.cssClassName;
          if ( ! this.$ ) return;
          this.$.style.height = this.cssHeight;
          this.className = this.cssClassName;
        }.bind(this));
      }
    },
    {
      name: 'cssStyleAttr',
      documentation: 'style="..." counterpart to $$DOC{.cssClassAttr}',
      code: function() {
        return this.cssHeight ? 'style="height:' + this.cssHeight + ';"' : '';
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <{{{this.tagName}}}
        id="{{{this.id}}}"
        <%= this.cssClassAttr() %>
        <%= this.cssStyleAttr() %> >
        <%= this.toInnerHTML() %>
      </{{{this.tagName}}}>
    */},
    function toInnerHTML() {/*
      <% if ( this.data && this.data.view ) { %>
        <%= this.data.view({}, this.sampleCodeContext) %>
      <% } %>
    */},
    function CSS() {/*
      view-output {
        position: relative;
        background: #F5F5F5;
        overflow: auto;
        display: flex;
        justify-content: center;
        flex-direction: column;
      }
      view-output.visible {
        padding: 5px;
      }
    */}
  ]
});
