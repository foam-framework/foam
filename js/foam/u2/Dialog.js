/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
CLASS({
  package: 'foam.u2',
  name: 'Dialog',
  extends: 'foam.u2.Element',

  documentation: 'This class is a basic dialog container: it has a heading, ' +
      'a body, and a set of actions. Generally, use ' +
      '$$DOC{ref:"foam.u2.EasyDialog"} to easily handle simple cases. For ' +
      'more complex cases, you can put any Element you like into a ' +
      '$$DOC{ref:"foam.u2.ModalOverlay"}.',

  requires: [
    'Action',
  ],

  imports: [
    'overlay',
  ],

  properties: [
    'title',
    'body',
    {
      type: 'Array',
      name: 'buttons',
      documentation: 'An array of buttons. Each is a [function, label] pair. ' +
          'These will be displayed in <em>reverse</em> order as MD buttons ' +
          'at the bottom of the dialog. The default is a single "OK" button ' +
          'that closes the dialog.',
      factory: function() {
        return [[function() { this.overlay.close(); }.bind(this), 'OK']];
      }
    },
    {
      type: 'Boolean',
      name: 'padding',
      documetation: 'Controls the padding inside the dialog.',
      attribute: true,
      defaultValue: true,
    },
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.cls(this.myCls());
      if (this.title) {
        this.start()
            .cls(this.myCls('header'))
            .enableCls(this.myCls('padding'), this.padding$)
            .add(this.title)
            .end();
      }
      this.start()
          .cls(this.myCls('body'))
          .enableCls(this.myCls('padding'), this.padding$)
          .add(this.body)
          .end();

      this.x({ data: this });
      this.start().cls(this.myCls('buttons')).add(this.buttons.map(function(b) {
        return this.Action.create({ name: b[1], label: b[1], code: b[0] });
      }.bind(this))).end();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        background-color: #fff;
        display: block;
        margin: 10px;
        overflow: hidden;
      }
      ^header {
        font-size: 20px;
        font-weight: 500;
      }
      ^padding {
        margin: 24px;
      }
      ^buttons {
        display: flex;
        flex-direction: row-reverse;
      }
    */},
  ]
});
