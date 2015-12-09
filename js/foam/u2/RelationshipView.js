/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'RelationshipView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DAOCreateController',
  ],
  imports: [
    'data',
    'stack',
  ],

  properties: [
    {
      name: 'relationship',
    },
    {
      name: 'view',
      attribute: true,
      factory: function() { return 'foam.u2.DAOController'; },
      adapt: function(old, nu) {
        if (typeof nu === 'string') {
          var m = this.X.lookup(nu);
          if (m) return m.create(null, this.Y);
        } else if (typeof nu === 'function') {
          return nu(this.Y);
        }
        return nu;
      }
    },
    {
      name: 'child_',
    },
    {
      name: 'model',
    },
    {
      name: 'relatedDAO',
      lazyFactory: function() {
        return this.data[this.relationship.name];
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.Y.set(
        daoize(this.X.lookup(this.relationship.relatedModel).name),
        this.relatedDAO);
    },
    function initE() {
      var view = this.view;
      var rel = this.relationship;

      view.model = this.model = this.Y.lookup(rel.relatedModel);
      view.data = this.relatedDAO;

      this.start('div').cls(this.myCls('header'))
          .start('span').cls(this.myCls('title')).add(rel.label).end()
          .x({ data: this })
          .add(this.ADD_ITEM)
          .end();

      this.child_ = view;
      this.add(view);
    },
  ],

  actions: [
    {
      name: 'addItem',
      ligature: 'add',
      code: function() {
        this.stack.pushView(this.DAOCreateController.create({
          model: this.model
        }));
      }
    },
  ],

  templates: [
    function CSS() {/*
      $-header {
        align-items: center;
        display: flex;
      }
      $-title {
        color: #999;
        font-size: 14px;
        font-weight: 500;
        margin-left: 16px;
        flex-grow: 1;
      }
    */},
  ]
});
