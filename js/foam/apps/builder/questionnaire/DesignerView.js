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
    'foam.apps.builder.datamodels.ModelPickerView',
    'foam.apps.builder.dao.DAOPickerView',
    'foam.apps.builder.questionnaire.ChangeModelWizard',
    'foam.apps.builder.questionnaire.ChangeDAOWizard',
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

  methods: [
    function init() {
      this.SUPER();
      // ModelSummaryView will use this, redirect to Questionnaire version
      this.Y.registerModel(this.ChangeModelWizard, 'foam.apps.builder.wizard.ChangeModelWizard');
      this.Y.registerModel(this.ChangeDAOWizard, 'foam.apps.builder.wizard.ChangeDAOWizard');
    }
  ],

  templates: [
    function toHTML() {/*
      <designer id="%%id" <%= this.cssClassAttr() %>>
        <div class="flex-row">
          $$appName
          $$version
        </div>
        <div class="flex-row-wrap">
          $$data{ model_: 'foam.apps.builder.ModelSummaryView' }
          $$data{ model_: 'foam.apps.builder.DAOSummaryView' }
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
        overflow-y: auto;
        overflow-x: hidden;
      }
      designer.questionnaire-designer .flex-row-wrap {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        flex-shrink: 0;
      }
      designer.questionnaire-designer .flex-row-wrap > * {
        flex-grow: 1;
      }

      designer.questionnaire-designer .flex-row {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
      }
      designer.questionnaire-designer .flex-row :first-child {
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
        box-shadow: 0px 3px 4px #444;
        overflow-y: hidden;
        min-height: 400px;
      }

      @media (min-width: 600px) {

      }
      @media (max-width: 600px) {
        designer.questionnaire-designer .preview-frame {
          margin: 0px;
          border: 8px solid grey;
          border-radius: 8px;
        }


      }


    */},

  ],
});
