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
  name: 'ProfileView',
  extends: 'foam.ui.View',
  requires: ['com.google.mail.GMailUserInfo', 'foam.ui.ImageView'],
  properties: [
    {
      type: 'Model',
      name: 'model',
      factory: function() { return this.GMailUserInfo; }
    },
    {
      name: 'className',
      defaultValue: 'profile'
    },
  ],
  templates: [
    function CSS() {/*
      .profile {
        align-items: flex-start;
        background: #db4437;
        box-shadow: 0 3px 6px #888;
        color: white;
        display: flex;
        flex-direction: column;
        padding: 10px 0 8px 15px;
      }
      .profile:hover {
        background: #db4437 !important;
      }

      .profile img {
        border-radius: 50%;
        flex-shrink: 0;
        flex-grow: 0;
        margin-bottom: 15px;
      }

      .profile .profile-text {
        align-items: flex-start;
        display: flex;
        flex-direction: column;
      }

      .profile .profile-name {
        font-weight: bold;
      }
    */},
    function toInnerHTML() {/*
      <% if (this.data) { %>
          $$avatarUrl{ model_: 'foam.ui.ImageView' }
          <div class="profile-text">
            $$name{ mode: 'read-only',  extraClassName: 'profile-name' }
            $$email{ mode: 'read-only', extraClassName: 'profile-email' }
          </div>
      <% } %>
    */}
  ]
});
