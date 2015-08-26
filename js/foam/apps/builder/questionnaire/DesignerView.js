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
  extendsModel: 'foam.ui.md.DetailView',

  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.questionnaire.EditView',
    'foam.apps.builder.questionnaire.QuestionnaireView',
  ],

  listeners: [
    {
      name: 'dataChange',
      code: function() {
        if (this.dataView) {
          // bind this better
          this.data.model.instance_.prototype_ = null;
          this.dataView.updateHTML();
        }
      }
    }
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'questionnaire-designer',
    },
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
      },
    },
    {
      type: 'foam.apps.builder.ExportManager',
      name: 'exportManager',
    },
  ],

  templates: [
    function toHTML() {/*
      <designer id="%%id" <%= this.cssClassAttr() %>>
        <div class="row-layout">
          $$appName
          $$version
        </div>
        <div class="preview-frame">
          $$data{ model_: 'foam.apps.builder.questionnaire.QuestionnaireView' }
        </div>
      </designer>
    */},
    function CSS() {/*
      designer.questionnaire-designer {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      designer.questionnaire-designer .row-layout {
        display: flex;
        flex-direction: row;
      }
      designer.questionnaire-designer .row-layout :first-child {
        flex-grow: 1;
      }

      designer.questionnaire-designer .preview-frame {
        position: relative;
        margin: 16px;
        border: 16px solid grey;
        border-radius: 16px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        box-shadow: -2px 2px 3px rgba(0.5,0.5,0.5,0.75);
      }
    */},

  ],
});
