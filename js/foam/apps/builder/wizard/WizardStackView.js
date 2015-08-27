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
  package: 'foam.apps.builder.wizard',
  name: 'WizardStackView',
  extendsModel: 'foam.ui.md.PopupView',

  requires: [
    'foam.ui.md.UpdateDetailView',
  ],

  exports: [
    'wizardStack'
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'firstPage',
    },
    {
      name: 'wizardStack',
      type: 'ViewFactoryProperty[]',
      lazyFactory: function() { return []; },
      documentation: function() {/* If a nextViewFactory on a
        $$DOC{ref:'foam.apps.builder.wizard.WizardPage'}
        is null, the next view is popped from the wizardStack. Use this stack
        to store parts of your workflow. For example, configuring a DAO, then
        configuring a Model. Either part can be used on its own, or start the
        DAO wizard and push the Model wizard factory onto the wizardStack and they
        will run in sequence.
      */},
    },
    {
      name: 'delegate',
      defaultValue: function(args, X) {
        var stack = X.lookup('foam.browser.ui.StackView').create({
            maxVisibleViews: 1,
            noDecoration: true,
            transition: 'fade',
        }, X);
        var Y = X.sub({ stack: stack });
        stack.pushView(this.firstPage({}, Y));
        return stack;
      }
    },
    {
      name: 'extraClassName',
      defaultValue: 'wizard-stack-view',
    },
  ],

  templates: [
    function CSS() {/*
      @media (min-width: 500px) {
        .wizard-stack-view .md-popup-view-content {
          width: 80%;
          height: 80%;
        }
      }
      @media (max-width: 500px) {
        .wizard-stack-view .md-popup-view-content {
          width: 100%;
          height: 100%;
          margin: -8px;
          padding: 0px;
        }
      }

    */},
  ],


});
