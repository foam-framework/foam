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
  package: 'foam.ui.md',
  name: 'UpdateDetailView',
  extends: 'foam.ui.md.BaseDetailView',

  requires: [
    'foam.ui.PopupChoiceView',
    'foam.ui.md.Toolbar',
    'foam.ui.md.ToolbarAction'
  ],

  imports: [
    'dao',
    'stack',
    'controllerMode'
  ],
  exports: [
    'toolbar as mdToolbar'
  ],

  properties: [
    {
      name: 'title',
      dynamicValue: function() {
        return (this.data && this.data.id ? 'Edit' : 'New') +
            (this.model ? ' ' + this.model.label : '');
      }
    },
    {
      name: 'rawData',
      documentation: 'The uncloned original input data.',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.rawUpdate);
        if ( nu ) nu.addListener(this.rawUpdate);
        // HACK(markdittmer): For envelope-based detail views.
        // TODO(markdittmer): Remove this once foam.browser has U2 views that
        // can do something like this on a case-by-case basis.
        if ( nu.data && nu.data.model_ ) {
          var modelClassName = nu.data.model_.id.replace(/[.]/g, '-');
          if ( this.$ ) {
            var className = this.$.className;
            className = className.replace(new RegExp(modelClassName, 'g'), '');
            className = className + ' ' + modelClassName;
            this.$.className = className;
          } else {
            this.extraClassName = modelClassName;
          }
        }
      }
    },
    {
      name: 'originalData',
      documentation: 'A clone of the input data, for comparison with edits.'
    },
    {
      name: 'data',
      preSet: function(_, v) {
        if ( ! v ) return undefined;
        this.rawData = v;
        return v.deepClone();
      },
      postSet: function(_, data) {
        if ( ! data ) return;
        this.originalData = data.deepClone();
        if ( data && data.model_ ) this.model = data.model_;
        var self = this;
        data.addPropertyListener(null, function(o, topic) {
          var prop = o.model_.getProperty(topic[1]);
          if ( prop.transient ) return;
          self.version++;
          self.rawData = '';
        });
      }
    },
    {
      name: 'immutable',
      documentation: 'Set to true if the view should never switch to ' +
          'X-and-check mode, even when there are changes.',
      defaultValue: false
    },
    {
      name: 'liveEdit',
      documentation: "Propagate edits immediately, and don't show the save button",
      defaultValue: false
    },
    {
      name: 'exitOnSave',
      documentation: "If true, saving will also exit the view.",
      defaultValue: false
    },
    {
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      type: 'Int',
      name: 'version'
    },
    {
      type: 'Boolean',
      name: 'showModelActions',
      defaultValue: true
    },
    {
      type: 'Boolean',
      name: 'outstandingChanges',
      hidden: true,
      dynamicValue: function() {
        this.version; this.immutable;
        return ! this.immutable && ! this.originalData.equals(this.data);
      },
      postSet: function(old,nu) {
        if ( nu && this.liveEdit ) {
          this.commit_();
        }
      }
    },
    {
      // type: 'foam.ui.md.Toolbar',
      name: 'toolbar',
      lazyFactory: function() {
        return this.Toolbar.create({
          data$: this.data$,
          title$: this.title$
        }, this.Y);
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          old.removeLeftActions(this.leftActions_);
          old.removeRightActions(this.rightActions_);
        }
        if ( nu ) {
          nu.addLeftActions(this.leftActions_);
          nu.addRightActions(this.rightActions_);
        }
      }
    },
    {
      type: 'ViewFactory',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: 'className',
      defaultValue: 'md-update-detail-view'
    },
    {
      type: 'Array',
      name: 'leftActions_',
      lazyFactory: function() {
        var myModel = this.model_;
        return [
          this.ToolbarAction.create({
            data: this,
            action: myModel.getAction('back')
          }, this.Y),
          this.ToolbarAction.create({
            data: this,
            action: myModel.getAction('reset')
          }, this.Y)
        ];
      },
      postSet: function(old, nu) {
        var toolbar = this.toolbar;
        if ( old === nu || ! toolbar ) return;
        if ( old ) toolbar.removeLeftActions(old);
        if ( nu ) toolbar.addLeftActions(nu);
      }
    },
    {
      type: 'Array',
      name: 'rightActions_',
      lazyFactory: function() {
        return [
          this.ToolbarAction.create({
            data: this,
            action: this.model_.getAction('save')
          }),
          this.ToolbarAction.create({
            data: this,
            action: this.model_.getAction('delete')
          })
        ];
      },
      postSet: function(old, nu) {
        var toolbar = this.toolbar;
        if ( old === nu || ! toolbar ) return;
        if ( old ) toolbar.removeRightActions(old);
        if ( nu ) toolbar.addRightActions(nu);
      }
    }
  ],

  actions: [
    {
      name: 'back',
      help:  'Go back',
      priority: 0,
      order: 0.0,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPUlEQVQ4y2NgGLbgf8P/BtKU////+78WacpDSFMeSlPlYaQo/0OacjyAcg1wJ4WTGmHDS4sWaVrqhm/mBQAoLpX9t+4i2wAAAABJRU5ErkJggg==',
      ligature: 'arrow_back',
      isAvailable: function() {
        return this.liveEdit || ! this.outstandingChanges;
      },
      code: function() { this.stack.popView(); }
    },
    {
      name: 'save',
      help:  'Save updates',
      priority: 0,
      order: 0,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAUElEQVQ4jWNgGAW4wH9d0pRH///zv4E05f+J1jB0lP9n+b/0fzgJpv8PBUr++R9BgmP+N4C1RJLgdqiWKBK8CtVCUsiAtBCvHKqFFOUjAwAATIhwjZSqeJcAAAAASUVORK5CYII=',
      ligature: 'check',
      isAvailable: function() { return  ! this.liveEdit && this.outstandingChanges; },
      code: function() {
        this.commit_();
      }
    },
    {
      name: 'delete',
      ligature: 'delete',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAOklEQVQ4y2NgGPzgv8L/B/9h4MF/BXxK8QDqaCDH/aSaP6phVAMuDa+wqn+BW4P//5eYyv/7DvI8DwBDJ5LB6mdU8gAAAABJRU5ErkJggg==',
      priority: 0,
      order: 0,
      isAvailable: function() {
        return this.controllerMode && this.controllerMode == 'update';
      },
      code: function() {
        this.dao.remove(this.data, {
          remove: function() {
            this.stack.popView();
          }.bind(this),
          error: function() {
            // TODO:
          }
        });
      }
    },
    {
      name: 'reset',
      priority: 0,
      order: 1.0,
      help: 'Reset form (cancel update)',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAdklEQVQ4y+WTuQ3AIBAEaQKK8NN/BEUArmccgGyj43MMIZo5TqtFqbUPJxYtbg2OvS44IJQKhguwdUETSiXjXr77KhGICRjihWKm8Dw3KXP4Z5VZ/Lfw7B5kyD1cy5C7uAx5iJcht6vhRTUi4OrC0Szftvi/vAFNdbZ2Dp661QAAAABJRU5ErkJggg==',
      ligature: 'close',
      isAvailable: function() { return  ! this.liveEdit && this.outstandingChanges; },
      code: function() { this.data = this.originalData.deepClone(); }
    }
  ],

  methods: [
    function commit_() {
      var self = this;
      var obj  = this.data;

      this.dao.put(obj, {
        put: function() {
          self.originalData = obj.deepClone();

          if (self.exitOnSave && ! self.liveEdit) {
            self.stack.popView();
          }
        },
        error: function() {
          console.error('Error saving', arguments);
        }
      });
    }
  ],

  listeners: [
    {
      name: 'rawUpdate',
      code: function() {
        // If this listener fires, the raw data updated and the user hasn't
        // changed anything.
        this.data = this.rawData;
      }
    }
  ],

  templates: [
    function CSS() {/*
      .md-update-detail-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }
      .md-update-detail-view-body {
        overflow-x: hidden;
        overflow-y: auto;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        %%toolbar
        <div class="md-update-detail-view-body">
          <%= this.innerView({ data$: this.data$ }, this.Y) %>
        </div>
      </div>
    */}
  ]
});
