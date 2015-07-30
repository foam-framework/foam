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
  package: 'foam.apps.builder.questionnaire',
  name: 'QuestionnaireController',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.questionnaire.DetailView',
    'foam.apps.builder.questionnaire.Questionnaire',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'appConfig',
      help: 'The configuration for app parameters, question set, etc.',
    },
    {
      name: 'dao',
      help: 'The store of questionnaires filled in by users.',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Questionnaire,
          name: 'questionnaires',
          daoType: this.IDBDAO,
          cache: true,
          seqNo: true,
          logging: true,
        });
      }
    },
    {
      name: 'content',
      help: 'The current questionnaire being edited',
      view: 'foam.apps.builder.questionnaire.DetailView',
      lazyFactory: function() {
        return this.appConfig.model.create();
      }
    },
  ],

  methods: [
    function reload() {
      this.content = this.appConfig.model.create();
    },
    function home() {
      this.dao.put(this.content, {
          put: function() {
            this.reload();
            //TODO: save ok notification
          }.bind(this),
          error: function() {
            //TODO: error notification
          }.bind(this),
      });
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        $$content
      </div>
    */},
    function CSS() {/*
    */},
  ]
});
