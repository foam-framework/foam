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
  name: 'FOAMBook',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Section',


  requires: [
    'foam.dao.EasyDAO',
    'foam.graphics.ActionButtonCView',
    'foam.input.touch.TouchManager',
    'foam.input.touch.GestureManager',
    'foam.flow.Watermark',
    'foam.flow.TitlePage',
    'foam.flow.BookTitle',
    'foam.flow.SubTitle',
    'foam.flow.Author',
    'foam.flow.ToC',
    'foam.flow.Section',
    'foam.flow.AceEditor',
    'foam.flow.CodeSample',
    'foam.flow.Aside',
    'foam.flow.GlossaryTerm',
    'foam.flow.Glossary'
  ],
  exports: [
    'glossaryTerms',
    'editorModel',
    'actionButtonModel'
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'glossaryTerms',
      factory: function() {
        return this.EasyDAO.create({
          model: this.GlossaryTerm,
          daoType: 'MDAO'
        }).orderBy(this.GlossaryTerm.ID);
      }
    },
    {
      name: 'editorModel',
      factory: function() {
        this.X.registerElement('editor', 'foam.flow.AceEditor');
        return this.AceEditor;
      }
    },
    {
      name: 'actionButtonModel',
      factory: function() {
        return this.ActionButtonCView;
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( ! this.X.touchManager ) {
          this.X.touchManager = this.TouchManager.create();
        }
        if ( ! this.X.gestureManager ) {
          this.X.gestureManager = this.GestureManager.create();
        }
        this.X.registerModel(this.ActionButtonCView.xbind({
          haloColor: 'rgb(240,147,0)'
        }),'foam.graphics.ActionButtonCView');
      }
    }
  ],

  templates: [
    { name: 'toHTML' },
    { name: 'CSS' }
  ]
});
