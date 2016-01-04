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
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction'
  ],
  imports: [
    'data',
    'stack',
    'controllerMode'
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
      name: 'mode',
      defaultValueFn: function() {
        return 'create' == this.controllerMode ? 'hidden': 'rw';
      }
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
    function updateMode_(m) {
      this.hide(m == 'hidden');
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
        if ( this.relationship.destinationModel ) {
          var dest = this.X.lookup(this.relationship.destinationModel);

          var view = this.X.lookup('foam.u2.DAOListView').create({
            data: this.X[daoize(dest.name)]
          }, this.Y);

          view.subscribe(view.ROW_CLICK, this.oneTime(function(_, _, obj) {
            var r = this.model.create(null, this.Y);
            r[this.relationship.destinationProperty] = obj.id;
            this.relatedDAO.put(r, {
              put: function(obj) {
                view.X.stack.replaceView(
                  this.X.lookup('foam.u2.DAOUpdateController').create({
                    model: this.model,
                    data: obj,
                    dao: this.relatedDAO
                  }, view.Y));
              }.bind(this)
            });
          }.bind(this)));

          var toolbar = this.Toolbar.create();
          toolbar.addLeftActions([
            this.ToolbarAction.create({
              action: Action.create({
                name: 'back',
                ligature: 'arrow_back',
                code: function() {
                  view.X.stack.popView();
                }
              }),
              data: view
            })
          ]);

          view = this.Y.E()
            .add(toolbar)
            .add(view);

          this.stack.pushView(view);
        } else {
          this.stack.pushView(this.DAOCreateController.create({
            model: this.model
          }));
        }
      }
    },
  ],

  templates: [
    function CSS() {/*
      ^header {
        align-items: center;
        display: flex;
      }
      ^title {
        color: #999;
        font-size: 14px;
        font-weight: 500;
        margin-left: 16px;
        flex-grow: 1;
      }
    */},
  ]
});
