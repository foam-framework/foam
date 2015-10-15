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
  name: 'ItemCount',
  package: 'foam.apps.quickbug.ui',
  extends: 'CountExpr',

  requires: [
    'foam.ui.View',
    'foam.apps.quickbug.model.Location'
  ],

  imports: [
    'QueryParser'
  ],

  properties: [
    {
      name: 'browser'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      console.assert( this.QueryParser, 'QueryParser not found');
    },
    toHTML: function() {
      this.eid = this.View.getPrototype().nextID();
      return '<span id="' + this.eid + '" class="idcount">' + this.count + '&nbsp;' + (this.count == 1 ? 'item' : 'items') + '</span>';
    },
    initHTML: function() {
      var f = function() {
        var altView = this.browser.view;
        var col = altView.views[1].view().col.data;
        var row = altView.views[1].view().row.data;
        var q = AND(
          this.QueryParser.parseString(this.browser.location.q),
          AND(EQ(col, this.x),
              EQ(row, this.y)).partialEval()).partialEval();
        this.browser.location.mode = this.Location.MODE.fromMemento.call(this.browser, 'list');
        this.browser.location.q = q.toMQL();
      }.bind(this);
      $(this.eid).addEventListener('click', f, false);
    }
  }
});
