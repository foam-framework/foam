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
/*
dao = DelayedDAO.create({
  delegate: dao,
  initialDelay: 3000
});
*/


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

var view = Y.PhysicsScrollView.create({
  model: Contact,
  rowView: 'ContactRowView',
  rowHeight: 130,
  dao: dao
});

view.write(document);
