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

  requires: [
    'foam.apps.builder.Panel',
    'foam.ui.md.DetailView',
    'foam.apps.builder.questionnaire.EditView',
    'Model',
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
      name: 'instance',
      help: 'An example of your questionnaire as a user would see it.',
//       getter: function() {
//         //this.data.model.instance_.prototype_ = undefined;
//         // return this.data.model.getPrototype().create();
//         return this.data.model.create();
//       }
    }
  ],

  templates: [
    function toHTML() {/*
      <kiosk-designer id="%%id" <%= this.cssClassAttr() %>>
        $$data{ model_: 'foam.apps.builder.Panel', innerView: 'foam.apps.builder.questionnaire.EditView' }
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
