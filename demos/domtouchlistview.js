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
  name: 'ContactRowView',
  extendsModel: 'DetailView',

  templates: [
    function toHTML() {/*
      <div class="scrolled-content" id="%%id" style="background:%%data.color">
        <div class="avatar"><b>%%data.avatar</b></div>
        <div style="position:relative;top:20px">
          <span>%%data.first <b>%%data.last</b></span>
        </div>
        <br>
        <div class="email">
          (<span>%%data.email</span>)
        </div>
      </div>
    */}
  ]
});

var Y = this.X.subWindow(window);
Y.registerModel(MomentumTouch, 'FOAMTouch');
Y.registerModel(MomentumTouchManager, 'TouchManager');

Y.TouchInput = Y.TouchManager.create({});
Y.TouchInput.install(document);

var view = Y.TouchListView.create({
  model: Contact,
  rowView: 'ContactRowView',
  rowViewHeight: 130,
  height: document.body.offsetHeight,
  dao: dao
});

view.write(document);
