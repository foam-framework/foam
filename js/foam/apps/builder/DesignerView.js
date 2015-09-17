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
  package: 'foam.apps.builder',
  name: 'DesignerView',
  extendsModel: 'foam.ui.View',
  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'Binding',
    'PersistentContext',
    'foam.apps.builder.AppConfigDetailView',
    'foam.apps.builder.DesignerViewContext',
    'foam.apps.builder.kiosk.KioskView',
    'foam.apps.builder.Panel',
    'foam.dao.IDBDAO',
    'foam.ui.OverlayHelpView',
    'foam.ui.HelpSnippetView',
  ],
  imports: [
    'mdToolbar as toolbar'
  ],

  properties: [
    'data',
    'toolbar',
    {
      model_: 'ViewFactoryProperty',
      name: 'panel',
      defaultValue: {
        factory_: 'foam.apps.builder.Panel',
        innerView: 'foam.apps.builder.AppConfigDetailView',
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'app',
      defaultValue: 'foam.apps.builder.kiosk.KioskView',
    },
    'panelView',
    'appView',
    {
      name: 'persistentContext',
      transient: true,
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      },
    },
    {
      type: 'foam.apps.builder.DesignerViewContext',
      name: 'ctx',
      transient: true,
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( this.$ && nu && nu.firstRun ) {
          this.constructHelpSnippets();
        }
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.persistentContext.bindObject(
          'ctx', this.DesignerViewContext, undefined, 1);
    },
    function initHTML() {
      this.SUPER();
      if ( this.ctx && this.ctx.firstRun ) this.constructHelpSnippets();
    },
  ],

  listeners: [
    {
      name: 'constructHelpSnippets',
      isMerged: 500,
      code: function () {
        var self = this;
        this.OverlayHelpView.create({
          helpSnippets: [
            this.HelpSnippetView.create({
              data: 'Configure your app using the options listed in the config view',
              extraClassName: 'md-body',
              target: this.panelView,
              beforeInit: function() {
                // If panel view is openable, target its contents.
                if ( self.panelView && self.panelView.open ) {
                  self.panelView.open(self.$);
                  this.target = self.panelView.delegateView ||
                      self.panelView.innerView || self.panelView;
                }
              },
              afterDestroy: function() {
                self.panelView && self.panelView.close &&
                    self.panelView.close();
              },
              location: 'ABOVE',
              actionLocation: 'TOP_RIGHT',
            }, this.Y),
            this.HelpSnippetView.create({
              data: 'See how your app looks with the live preview',
              extraClassName: 'md-body',
              target: this.appView,
              location: 'ABOVE',
              actionLocation: 'TOP_RIGHT',
            }, this.Y),
            this.HelpSnippetView.create({
              data: "When you're ready, use the action toolbar to package, download, upload, or publish your app",
              extraClassName: 'md-body',
              target: this.toolbar.rightActionList,
              location: 'BELOW',
              actionLocation: 'BOTTOM_RIGHT',
            }, this.Y),
          ],
          onComplete: function() {
            this.ctx.firstRun = false;
          }.bind(this)
        }, this.Y).construct();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <designer id="%%id" <%= this.cssClassAttr() %>>

        <% this.panelView = this.panel({
             zIndex: 2,
           }, this.Y);
           this.appView = this.app({
             zIndex: 1,
           }, this.Y);
           this.addDataChild(this.panelView);
           this.addDataChild(this.appView); %>

        <%= this.panelView %>
        <%= this.appView %>

      </designer>
    */},
    function CSS() {/*
      designer {
        position: relative;
        display: flex;
        flex-grow: 1;
      }
    */},
  ],
});
