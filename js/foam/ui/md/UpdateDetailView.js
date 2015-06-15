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
  extendsModel: 'foam.ui.md.DetailView',

  imports: [
    'dao',
    'stack'
  ],

  properties: [
    {
      name: 'rawData',
      documentation: 'The uncloned original input data.',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.rawUpdate);
        if ( nu ) nu.addListener(this.rawUpdate);
      }
    },
    {
      name: 'originalData',
      documentation: 'A clone of the input data, for comparison with edits.'
    },
    {
      name: 'data',
      preSet: function(_, v) {
        if ( ! v ) return;
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
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      model_: 'IntProperty',
      name: 'version'
    },
    {
      model: 'BooleanProperty',
      name: 'outstandingChanges',
      hidden: true,
      dynamicValue: function() {
        this.version;
        return ! this.originalData.equals(this.data);
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: 'className',
      defaultValue: 'md-update-detail-view'
    },
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

  actions: [
    {
      name:  'save',
      help:  'Save updates.',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAUElEQVQ4jWNgGAW4wH9d0pRH///zv4E05f+J1jB0lP9n+b/0fzgJpv8PBUr++R9BgmP+N4C1RJLgdqiWKBK8CtVCUsiAtBCvHKqFFOUjAwAATIhwjZSqeJcAAAAASUVORK5CYII=',
      isAvailable: function() { return this.outstandingChanges; },
      action: function() {
        var self = this;
        var obj  = this.data;

        this.dao.put(obj, {
          put: function() {
            self.originalData.copyFrom(obj);
          },
          error: function() {
            console.error('Error saving', arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAdklEQVQ4y+WTuQ3AIBAEaQKK8NN/BEUArmccgGyj43MMIZo5TqtFqbUPJxYtbg2OvS44IJQKhguwdUETSiXjXr77KhGICRjihWKm8Dw3KXP4Z5VZ/Lfw7B5kyD1cy5C7uAx5iJcht6vhRTUi4OrC0Szftvi/vAFNdbZ2Dp661QAAAABJRU5ErkJggg==',
      isAvailable: function() { return this.outstandingChanges; },
      action: function() { this.stack.popView(); }
    },
    {
      name:  'back',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPUlEQVQ4y2NgGLbgf8P/BtKU////+78WacpDSFMeSlPlYaQo/0OacjyAcg1wJ4WTGmHDS4sWaVrqhm/mBQAoLpX9t+4i2wAAAABJRU5ErkJggg==',
      isAvailable: function() { return ! this.outstandingChanges; },
      action: function() { this.stack.popView(); }
    },
    {
      name: 'reset',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAdklEQVQ4y+WTuQ3AIBAEaQKK8NN/BEUArmccgGyj43MMIZo5TqtFqbUPJxYtbg2OvS44IJQKhguwdUETSiXjXr77KhGICRjihWKm8Dw3KXP4Z5VZ/Lfw7B5kyD1cy5C7uAx5iJcht6vhRTUi4OrC0Szftvi/vAFNdbZ2Dp661QAAAABJRU5ErkJggg==',
      isAvailable: function() { return this.outstandingChanges; },
      action: function() { this.data.copyFrom(this.originalData); }
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
      .md-update-detail-view-header {
        align-items: center;
        background-color: #3e50b4;
        color: #fff;
        display: flex;
        flex-shrink: 0;
        flex-grow: 0;
        font-size: 20px;
        font-weight: 500;
        height: 56px;
        padding: 0 12px;
        width: 100%;
      }

      .md-update-detail-view-body {
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div class="md-update-detail-view-header">
          $$back $$reset
          $$title{
            mode: 'read-only',
            extraClassName: 'expand',
            floatingLabel: false
          }
          <span id="<%= this.id %>-header-actions" class="md-update-detail-view-header-actions">
            <%
              var actions = this.data.model_.actions;
              if (actions && actions.length) {
                for (var i = 0; i < actions.length; i++) {
                  if (actions[i].iconUrl) {
                    out(this.createTemplateView(actions[i].name, { X: this.Y }));
                  }
                }
              }
            %>
          </span>
          <% this.setClass('hidden', function() { return self.outstandingChanges },
              this.id + '-header-actions'); %>
          $$save
        </div>
        <div class="md-update-detail-view-body">
          <%= this.innerView({ data$: this.data$ }, this.Y) %>
        </div>
      </div>
    */},
  ]
});
