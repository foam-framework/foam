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
  package: 'com.google.mail',
  name: 'MenuView',
  extends: 'foam.ui.View',

  traits: ['foam.ui.layout.PositionedDOMViewTrait'],
  requires: [
    'com.google.mail.MenuLabelCitationView',
    'com.google.mail.FOAMGMailLabel',
    'com.google.mail.ProfileView',
    'foam.lib.email.EMail'
  ],
  imports: [
    'profile$',
    'EMailDAO'
  ],
  exports: ['counts'],
  properties: [
    {
      name: 'topSystemLabelDAO',
      view: { factory_: 'foam.ui.DAOListView', rowView: 'com.google.mail.MenuLabelCitationView' }
    },
    {
      name: 'bottomSystemLabelDAO',
      view: { factory_: 'foam.ui.DAOListView', rowView: 'com.google.mail.MenuLabelCitationView' }
    },
    {
      name: 'userLabelDAO',
      view: { factory_: 'foam.ui.DAOListView', rowView: 'com.google.mail.MenuLabelCitationView' }
    },
    {
      name: 'preferredWidth',
      defaultValue: 280
    },
    {
      name: 'counts',
      factory: function() {
        var sink = GROUP_BY(this.EMail.LABELS, COUNT());
        this.EMailDAO.select(sink);
        return sink;
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*
      <div class="menuView">
        <div class="menuHeader">
          <%= this.ProfileView.create({ data$: this.profile$ }) %>
        </div>
        $$topSystemLabelDAO
        <hr>
        $$bottomSystemLabelDAO
        <hr>
        <%= this.MenuLabelCitationView.create({
          data: this.FOAMGMailLabel.create({
            id: 'All Mail',
            name: 'All Mail'
          })
        }) %>
        $$userLabelDAO
      </div>
    */},
    function CSS() {/*
      .menuView {
        height: 100%;
        display: block;
        overflow-y: auto;
        background: white;
      }

      .menuView div:hover {
        background: #e0e0e0;
      }
   */}
  ]
});
