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
  package: 'foam.apps.chatter.ui',
  name: 'ClientView',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.apps.chatter.ui.ChannelView',
    'foam.apps.chatter.Channel',
    'foam.apps.chatter.ui.ChannelCitationView',
    'foam.apps.chatter.ui.NotificationsView',
    'foam.ui.DAOListView'
  ],
  imports: [
    'window',
  ],
  exports: [
    'selection$',
    'as clientView'
  ],
  properties: [
    {
      name: 'newChannel',
      postSet: function(_, name) {
        if ( name ) {
          this.data.channelDAO.put(
            this.Channel.create({
              name: name
            }));
          this.newChannel = '';
        }
      }
    },
    {
      name: 'selection'
    },
    'channelDAOView',
    {
      name: 'windows',
      factory: function() { return {}; }
    },
    {
      name: 'notificationsView',
      factory: function() { return this.NotificationsView.create(); }
    }
  ],
  methods: [
    function openChannel(id) {
      if ( this.windows[id] && this.windows[id].window ) {
        this.windows[id].focus();
        return;
      }
      var window = foam.ui.Window.create({
        window: this.window.open("", "", "")}, this.Y);
      var X = window.Y;
      this.windows[id] = window.window;

      this.data.channelDAO.find(id, {
        put: function(c) {
          X.writeView(this.ChannelView.create({ data: c }, X));
        }.bind(this),
        error: function() {
          window.close();
        }
      });
    },
    function initHTML() {
      this.SUPER();
      this.channelDAOView.subscribe(this.channelDAOView.ROW_CLICK, this.onChannelSelect);
      this.addDestructor(function() {
        this.channelDAOView.unsubscribe(this.channelDAOView.ROW_CLICK, this.onChannelSelect);
      }.bind(this));
    }
  ],
  listeners: [
    {
      name: 'onChannelSelect',
      code: function() {
        var id = this.channelDAOView.selection.id;
        this.openChannel(id);
      }
    }
  ],
  templates: [
    { name: 'toHTML' }
  ]
});
