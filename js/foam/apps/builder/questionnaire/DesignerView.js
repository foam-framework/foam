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
  name: 'DesignerView',
  extendsModel: 'foam.ui.View',
  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.Panel',
    'foam.ui.md.DetailView',
    'foam.apps.builder.questionnaire.EditView',
    'foam.apps.builder.questionnaire.QuestionnaireView',
    'Model',
    'foam.apps.builder.AppConfigDetailView',
    'foam.ui.StringArrayView',
    'foam.ui.ArrayView',
    'foam.ui.TextAreaView',
    'foam.ui.FunctionView',
  ],

  imports: [
    'exportManager$',
  ],

  constants: {
    AUX_DATA_PROPS: [
      'config',
      'chrome',
    ],
  },

  listeners: [
    {
      name: 'dataChange',
      code: function() {
        if (this.instanceView) {
          // bind this better
          //this.instanceView.data = this.instance;
          //this.instanceView.updateHTML();
          this.data.model.instance_.prototype_ = null;
          this.instance = this.data.model.create();
          this.instanceView.updateHTML();
        }
      }
    }
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if (nu) {
          nu.addListener(this.dataChange);
        }
        if (old) {
          old.removeListener(this.dataChange);
        }
        this.data.model.instance_.prototype_ = null;
        this.instance = this.data.model.create();
      }
    },
    {
      type: 'foam.apps.builder.ExportManager',
      name: 'exportManager',
    },
    {
      name: 'instance',
      help: 'An example of your questionnaire as a user would see it.',
    }
  ],

  methods: [
    function destroy(s) {
      this.SUPER(s);
      if (this.data) this.data.removeListener(this.dataChange);
    }

  ],

  templates: [
    function toHTML() {/*
      <kiosk-designer id="%%id" <%= this.cssClassAttr() %>>
        $$data{
          model_: 'foam.apps.builder.Panel',
          innerView: { factory_: 'foam.apps.builder.AppConfigDetailView',
                       innerView: 'foam.apps.builder.questionnaire.EditView' }
        }
        $$data{ model_: 'foam.apps.builder.questionnaire.QuestionnaireView' }
      </kiosk-designer>
    */},
    function CSS() {/*
      kiosk-designer {
        position: relative;
        display: flex;
        flex-grow: 1;
      }
      kiosk-designer panel { z-index: 2; }
      kiosk-designer kiosk { z-index: 1; }
    */},
  ],
});
