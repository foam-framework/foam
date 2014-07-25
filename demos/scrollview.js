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

var dao = EasyDAO.create({
  model: Contact,
  seqNo: true,
  daoType: 'MDAO',
  cache: false
});

addContacts(dao);

// Uncomment this if you'd like to simulate a slow dao.
// dao = SlowDAO.create({delegate: dao});

MODEL({
  name: 'AvatarView',
  extendsModel: 'DetailView',

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
        <b>%%data.avatar</b>
      </div>
    */}
  ],
});

MODEL({
  name: 'ContactRowView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'avatarView',
      defaultValue: 'AvatarView'
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
                  -webkit-backface-visibility: hidden;
                  margin: 5px 20px 30px 25px;
                  text-align: center;
                  border-radius: 10px;
                  font-family: 'Roboto', sans-serif;
                  font-size: 5ex;
                  color: #333;
                  height: 110px;">
        <%
          var avatar = FOAM.lookup(this.avatarView).create({ data$: this.data$ });
          this.addChild(avatar);
          out(avatar.toHTML());
        %>
        <div style="position:relative;top:20px">
          <span>%%data.first <b>%%data.last</b></span>
        </div>
        <br>
        <div style="font-family: 'Roboto', sans-serif;
                    font-size: 1ex;
                    font-style: bold;
                    text-align: center;
                    position: relative;
                    top: -25px;">
          (<span>%%data.email</span>)
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
Y.touchManager = Y.TouchManager.create({});
Y.touchManager.install(document);
Y.gestureManager = Y.GestureManager.create();

var view = Y.ScrollView2.create({
  model: Contact,
  rowView: 'ContactRowView',
  rowHeight: 130,
  height: document.body.offsetHeight,
  dao: dao
});

view.write(document);
