/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

var dao = X.lookup('foam.dao.EasyDAO').create({
  model: Contact,
  seqNo: true,
  daoType: 'MDAO',
  cache: false
});

addContacts(dao);

// Uncomment this if you'd like to simulate a slow dao.
/*
dao = DelayedSelectDAO.create({
  delegate: dao,
  initialDelay: 3000
});
*/


CLASS({
  name: 'AvatarView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data',
      postSet: function(_, nu) {
        if ( this.$ ) this.updateHTML();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id"
           style="background: #068BA5;
                  border-radius: 10px;
                  position: absolute;
                  left: 5px;
                  top: 15px;
                  width: 50px;
                  height: 50px;
                  color: #F1F3D8;
                  font-family: 'Roboto', sans-serif;
                  font-size: 2ex;
                  font-style: bold;
                  text-align: center;
                  line-height: 50px;">
        <%= this.toInnerHTML() %>
      </div>
    */},
    function toInnerHTML() {/*
      <b>%%data.avatar</b>
    */}
  ],
});

CLASS({
  name: 'ContactRowView',
  extends: 'foam.ui.DetailView',

  properties: [
    {
      name: 'avatarView',
      defaultValue: 'AvatarView'
    },
    {
      name: 'model',
      defaultValue: Contact
    },
    {
      name: 'mode',
      defaultValue: 'read-only'
    }
  ],

  /* FIXME: the following doesn't work at the moment.
   * $$avatar{model_: this.avatarView}
   */
  templates: [
    function toHTML() {/*
      <div id="%%id"
           style="background:%%data.color ;
                  margin: 5px 20px 30px 25px;
                  text-align: center;
                  border-radius: 10px;
                  font-family: 'Roboto', sans-serif;
                  font-size: 5ex;
                  color: #333;
                  height: 110px;">
        <%
          var avatar = lookup(this.avatarView).create({ data$: this.data$ });
          this.addChild(avatar);
          out(avatar.toHTML());
        %>
        <div style="position:relative;top:20px">
          <span>$$first{ mode: 'read-only' } <b>$$last{ mode: 'read-only' }</b></span>
        </div>
        <br>
        <div style="font-family: 'Roboto', sans-serif;
                    font-size: 1ex;
                    font-style: bold;
                    text-align: center;
                    position: relative;
                    top: -25px;">
          (<span>$$email{ mode: 'read-only' }</span>)
        </div>
      </div>
    */}
  ]
});

/*
var Y = this.X.subWindow(window);
Y.registerModel(MomentumTouch, 'FOAMTouch');
Y.registerModel(MomentumTouchManager, 'TouchManager');

Y.TouchInput = Y.TouchManager.create({});
Y.TouchInput.install(document);
*/

var Y = this.X.subWindow(window);
Y.touchManager = Y.foam.input.touch.TouchManager.create({});
Y.touchManager.install(document);
Y.gestureManager = Y.foam.input.touch.GestureManager.create();

var view = Y.ScrollView.create({
  model: Contact,
  rowView: 'ContactRowView',
  rowHeight: 130,
  dao: dao
});

view.write();
