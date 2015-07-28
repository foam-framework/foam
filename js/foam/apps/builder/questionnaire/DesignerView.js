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

  properties: [
    {
      name: 'instance',
      help: 'An example of your questionnaire as a user would see it.',
      getter: function() {
        //this.data.model.instance_.prototype_ = undefined;
        // return this.data.model.getPrototype().create();
        console.log(this.data.$UID, "data model", this.data.model.$UID);
        return this.data.model.create();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <kiosk-designer id="%%id" <%= this.cssClassAttr() %>>
        $$data{ model_: 'foam.apps.builder.Panel', innerView: 'foam.apps.builder.questionnaire.EditView' }
        $$instance{ model_: 'foam.ui.md.DetailView' }
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
