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
  name: 'QuestionnaireView',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'ViewFactoryProperty',
    'foam.apps.builder.AppToolbarView',
    'foam.apps.builder.TOSData',
    'foam.apps.builder.TOSView',
    'foam.apps.builder.Timeout',
    'foam.apps.builder.questionnaire.AppConfig',
    'foam.apps.builder.questionnaire.QuestionnaireController',
    'foam.ui.md.FlatButton',
    'foam.ui.md.PopupView',
  ],
  exports: [
    'as kiosk',
    'url$',
    'controller',
    'controller as controller',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          old.termsOfService$.removeListener(this.onTOSChange);
          old.sessionDataTimeoutTime$.removeListener(this.onCacheTimeoutChange);
          old.sessionTimeoutTime$.removeListener(this.onHomeTimeoutChange);
        }
        if ( nu ) {
          this.tosData.tos = this.data.termsOfService;
          nu.termsOfService$.addListener(this.onTOSChange);
          nu.sessionDataTimeoutTime$.addListener(this.onCacheTimeoutChange);
          nu.sessionTimeoutTime$.addListener(this.onHomeTimeoutChange);
        }
      },
    },
    {
      name: 'toolbarItems',
      lazyFactory: function() {
        return [
          function() {
            return this.controller.createTemplateView('save');
          }.bind(this),
          function() {
            return this.controller.createTemplateView('reload');
          }.bind(this),
        ];
      },
    },
    {
      name: 'toolbarView',
      lazyFactory: function() {
        return this.AppToolbarView.create({ data$: this.toolbarItems$ }, this.Y);

      },
    },
    {
      name: 'tosData',
      lazyFactory: function() {
        return this.TOSData.create({}, this.Y);
      },
    },
    {
      type: 'foam.ui.md.PopupView',
      name: 'tosView',
      lazyFactory: function() {
        return this.PopupView.create({
          delegate: this.TOSView,
          data$: this.tosData$,
          blockerMode: 'modal'
        }, this.Y);
      },
    },
    {
      name: 'controller',
      lazyFactory: function() {
        return this.QuestionnaireController.create({ data$: this.data$ }, this.Y);
      },
      postSet: function(old, nu) {
        if ( old ) old.unsubscribe(['action'], this.onControllerAction);
        if ( nu ) nu.subscribe(['action'], this.onControllerAction);
      },
    },
    {
      type: 'String',
      name: 'url',
    },
    {
      name: 'cacheTimeout',
      factory: function() {
        return this.Timeout.create({
          minutes: this.data ? this.data.sessionDataTimeoutTime : 0,
          callback: this.onCacheTimeout,
        });
      },
    },
    {
      name: 'homeTimeout',
      factory: function() {
        return this.Timeout.create({
          minutes: this.data ? this.data.sessionTimeoutTime : 0,
          callback: this.onHomeTimeout,
        });
      },
    },
  ],

  methods: [
    function init() {
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'ICON_ONLY',
        height: 24,
        width: 24,
        color: 'black'
      }), 'foam.ui.ActionButton');
    },
    function initHTML() {
      this.SUPER();
      if ( this.data.termsOfService )
        this.openTOS();
      else
        this.closeTOS();
    },
    function logout() {
      this.controller.ahome(function() {
        this.controller.clearCache();
        this.openTOS();
      }.bind(this));
    },
    function openTOS() {
      this.tosData.accepted = false;
      this.tosView.open(this.$);
    },
    function closeTOS() { this.tosView.close(); },
  ],

  listeners: [
    {
      name: 'onTOSChange',
      code: function() {
        this.tosData.tos = this.data.termsOfService;
        if ( this.tosData.tos )
          this.openTOS();
        else
          this.closeTOS();
      },
    },
    {
      name: 'onControllerAction',
      code: function() {
        this.cacheTimeout.restart();
        this.homeTimeout.restart();
      },
    },
    {
      name: 'onCacheTimeoutChange',
      code: function() {
        this.cacheTimeout.cancel();
        var minutes = this.data ? this.data.sessionDataTimeoutTime : 0;
        this.cacheTimeout.minutes = minutes;
        if ( minutes ) this.cacheTimeout.start();
      },
    },
    {
      name: 'onHomeTimeoutChange',
      code: function() {
        this.homeTimeout.cancel();
        var minutes = this.data ? this.data.sessionTimeoutTime : 0;
        this.homeTimeout.minutes = minutes;
        if ( minutes ) this.homeTimeout.start();
      },
    },
    {
      name: 'onCacheTimeout',
      code: function() { this.controller.clearCache(); },
    },
    {
      name: 'onHomeTimeout',
      code: function() {
        this.url = this.data.homepage;
        this.openTOS();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <questionnaire id="%%id" <%= this.cssClassAttr() %>>
        %%tosView
        %%toolbarView
        %%controller
      </questionnaire>
    */},
    function CSS() {/*

      designer questionnaire {
        height: auto;
      }

      questionnaire, questionnaire .kiosk-controller {
        display: flex;
        flex-grow: 1;
        position: relative;
        flex-direction: column;
        height: 100%;
      }
      questionnaire kiosk-chrome {
        z-index: 2;
      }
      questionnaire .kiosk-controller {
        z-index: 1;
      }
    */},
  ],
});
