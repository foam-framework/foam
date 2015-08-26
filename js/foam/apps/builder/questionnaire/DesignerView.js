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
  extendsModel: 'foam.apps.builder.DesignerView',

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
      },
    },
    {
      type: 'foam.apps.builder.ExportManager',
      name: 'exportManager',
    },
    {
      name: 'instance',
      help: 'An example of your questionnaire as a user would see it.',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'panel',
      defaultValue: {
        factory_: 'foam.apps.builder.Panel',
        innerView: {
          factory_: 'foam.apps.builder.AppConfigDetailView',
          innerView: 'foam.apps.builder.questionnaire.EditView',
        },
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'appView',
      defaultValue: 'foam.apps.builder.questionnaire.QuestionnaireView',
    },
  ],
});
