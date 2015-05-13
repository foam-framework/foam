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
  name: 'FOAMByExample',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Section',

  requires: [
    'foam.flow.AceCodeView',
    'foam.flow.Aside',
    'foam.flow.BookTitle',
    'foam.flow.CodeSample',
    'foam.flow.CodeSnippet',
    'foam.flow.CodeView',
    // 'foam.flow.ExpandableSection',
    'foam.flow.QuoteCode',
    'foam.flow.Section',
    'foam.flow.TitlePage',
    'foam.flow.ToC',
    'foam.flow.VirtualConsoleView',
    'foam.graphics.ActionButtonCView',
    // 'foam.ui.md.SectionView'
  ],
  exports: [
    'codeSnippets',
    'codeViewName',
    'actionButtonName',
    'aceScript$'
  ],

  properties: [
    {
      model_: 'DAOProperty',
      name: 'codeSnippets',
      factory: function() { return []; }
    },
    {
      model_: 'StringProperty',
      name: 'codeViewName',
      factory: function() {
        this.X.registerElement('code-view', 'foam.flow.AceCodeView');
        return 'foam.flow.AceCodeView';
      }
    },
    {
      name: 'aceScript'
    },
    {
      name: 'actionButtonName',
      factory: function() {
        this.X.registerModel(this.ActionButtonCView.xbind({
          haloColor: 'rgb(240,147,0)'
        }), 'foam.ui.ActionButton');
        return 'foam.ui.ActionButton';
      }
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
      // this.X.registerModel(this.SectionView.xbind({
      //   expandedIconUrl: 'https://www.gstatic.com/images/icons/material/system/1x/expand_less_black_36dp.png'
      // }), 'foam.ui.md.SectionView');
      this.X.registerModel(this.Aside.xbind({
        extraClassName: 'full'
      }), 'foam.flow.Aside');
      this.X.registerModel(this.CodeSample.xbind({
        openSnippets: [-1]
      }), 'foam.flow.CodeSample');
      this.X.registerModel(this.VirtualConsoleView.xbind({
        scrollable: false
      }), 'foam.flow.VirtualConsoleView');

      // TODO: Remove this stuff once the template parser understand unknown tags
      // better
      this.FOAMWindow.installModel(this.AceCodeView);
      this.FOAMWindow.installModel(this.Aside);
      this.FOAMWindow.installModel(this.BookTitle);
      this.FOAMWindow.installModel(this.CodeSample);
      this.FOAMWindow.installModel(this.CodeSnippet);
      this.FOAMWindow.installModel(this.QuoteCode);
      this.FOAMWindow.installModel(this.Section);
      this.FOAMWindow.installModel(this.TitlePage);
      this.FOAMWindow.installModel(this.ToC);
      this.FOAMWindow.installModel(this.VirtualConsoleView);

      // TODO(markdittmer): Switch from Section to SectionView/ExpandableSection
      // once expandable contents renders properly with FLOW contents.
      // this.FOAMWindow.installModel(this.SectionView);
      // this.FOAMWindow.installModel(this.ExpandableSection);
    }
  },

  templates: [
    { name: 'toHTML' },
    { name: 'CSS' }
  ]
});
