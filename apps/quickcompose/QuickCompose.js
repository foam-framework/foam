/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var QuickEMail = FOAM({
  model_: 'Model',
  extendsModel: 'EMail',
  name: 'QuickEMail',
  properties: [
    { name: 'to' },
    { name: 'subject' },
    { name: 'body' }
  ]
});


var QuickEMailView = Model.create({
  name: 'QuickEMailView',

  extendsModel: 'DetailView',

  templates: [
    {
      name: "toHTML",
      template: '<div id="<%= this.getID() %>">' +
        '<%= this.createView(QuickEMail.TO).toHTML() %>' +
        '<%= this.createView(QuickEMail.SUBJECT).toHTML() %>' +
        '<%= this.createView(QuickEMail.BODY).toHTML() %>' +
        '</div>'
    }
  ]
});


var QuickCompose = Model.create({
  name: 'QuickCompose',

  properties: [
    {
      name: 'window'
    },
    {
      name: 'email',
      valueFactory: function() { return QuickEMail.create(); }
    },
    {
      name: 'view',
      valueFactory: function() {
        return QuickEMailView.create({
          model: QuickEMail
        });
      }
    },
    {
      name: 'EMailDAO',
      defaultValueFn: function() { return EMailDAO; }
    },
    {
      name: 'ContactDAO',
      defaultValueFn: function() { return ContactDAO; }
    },
  ],

  methods: {
    initHTML: function() {
      this.view.value = this.propertyValue('email');
      this.view.initHTML();
    }
  },

  templates: [
    {
      name: "toHTML",
      description: "",
      template: "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"foam.css\" /><link rel=\"stylesheet\" type=\"text/css\" href=\"quickcompose.css\" />\u000a  <title>Quick Compose</title></head><body><%= this.view.toHTML() %></body>\u000a</html>"
    }
  ]
});