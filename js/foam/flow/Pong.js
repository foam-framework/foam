
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
  name: 'Pong',
  package: 'foam.flow',
  extends: 'foam.flow.Section',

  requires: [
    'foam.flow.CodeView',
    'foam.flow.QuoteCode',
    'foam.flow.ExpandableSection',
    'foam.ui.md.SectionView'
  ],

  properties: [
    {
      name: 'mode',
      defaultValue: 'read-only'
    }
  ],

  imports: [
    'FOAMWindow'
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.X.registerModel(this.CodeView.xbind({
        readOnlyMinLines: 1,
        readOnlyMaxLines: 100
      }), 'foam.flow.CodeView');
      this.X.registerModel(this.SectionView.xbind({
        expandedIconUrl: 'https://www.gstatic.com/images/icons/material/system/1x/expand_less_black_36dp.png'
      }), 'foam.ui.md.SectionView');

      // TODO: Remove this stuff once the template parser understand unknown tags
      // better
      this.CodeView.getProperty('registerElement').documentInstallFn.call(
        this.CodeView.getPrototype(), this.X);
      this.QuoteCode.getProperty('registerElement').documentInstallFn.call(
        this.QuoteCode.getPrototype(), this.X);
      this.ExpandableSection.getProperty('registerElement').documentInstallFn.call(
        this.ExpandableSection.getPrototype(), this.X);
    }
  },

  templates: [
    { name: 'toInnerHTML' },
    {
      name: 'CSS',
      template: multiline(function() {/*
        .card pong { position: absolute; top: 0px }
        pong p { padding: 10px; }
        pong code, pong code-view {
          font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        }
        pong expandable-section {
          padding: 0px 30px;
        }
        pong li, pong heading, pong heading * {
          font-size: 30px;
          margin: 4px 0px 2px 0px;
        }
        pong p, pong li * {
          font-size: 14px;
          font-family: arial, sans-serif;
        }
      */})
    }
  ]
});
