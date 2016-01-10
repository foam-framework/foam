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

// Experimental DOM-backed text-area for displaying large amounts
// of data efficiently.
// Results: about 10 times faster to load data
//          with 100k rows it uses 96M of memory vs 250M

CLASS({
  package: 'foam.demos',
  name: 'TextAreaDAOView',
  extends: 'foam.ui.AbstractDAOView',

  requires: [
    'foam.graphics.ScrollCView'
  ],

  properties: [
    {
      type: 'Int',
      name: 'rows',
      mode: 'read-only',
      defaultValue: 24
    },
    {
      name: 'scrollbar',
      type: 'ScrollCView',
      factory: function() {
        var sb = this.ScrollCView.create({height:490, width: 24, x: 1, y: 0, size: 200, extent: 10});

        sb.value$.addListener(this.onDAOUpdate);

        return sb;
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div style="display:flex;-webkit-display:flex;height:700;">
        <pre id="%%id" style="flex:1 1 100%;-webkit-flex:1 1 100%;overflow-x:auto;overflow-y:hidden;"></pre>
        <span style="width:22px;flex:none;-webkit-flex:none;overflow:hidden;">
          <%= this.scrollbar %>
        </span>
      </div>
    */}
  ],

  methods: {
    rowToString: function(o) {
      return o.toString();
    },
    generateContent: function() {
      if ( ! this.$ ) return;
      var out  = '';
      var self = this;
      this.dao.select(COUNT())(function (c) {
        self.scrollbar.extend = self.rows;
        self.scrollbar.size = c.count;
        self.dao.skip(self.scrollbar.value).limit(self.rows).select({
          put: function(o) {
            out += self.rowToString(o);
            out += '\n';
          }
        })(function () {
          self.$.innerHTML = '';
          self.$.innerHTML = out;
        });
      });
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() { this.updateHTML(); }
    }
  ]
});


CLASS({
  name: 'StandardTextAreaDAOView',
  extends: 'foam.ui.AbstractDAOView',

  properties: [
    {
      name: 'tagName',
      defaultValue: 'pre'
    },
    {
      name: 'dao',
      postSet: function(_, dao) {
        var self = this;
        dao.listen({
          put: function(o) {
            var row = document.createElement('x-row');
            self.$.appendChild(row);
            row.innerHTML = o.toString() + '\n';
          }
        });
      }
    },
    {
      name: 'className',
      defaultValue: 'stadv'
    }
  ],

  templates: [
    function CSS() {/* .stadv { height: 500px; width: 1000px; overflow: auto; } */}
  ]
});


CLASS({
  package: 'foam.demos',
  name: 'TextAreaDAOViewTest',

  requires: [
    'foam.graphics.Graph',
    'foam.ui.ChoiceView'
  ],

  properties: [
    {
      type: 'Int',
      name: 'rows'
    },
    {
      type: 'Int',
      name: 'maxRows',
      defaultValue: 500000
    },
    {
      type: 'Int',
      name: 'rps',
      label: 'RPS',
      postSet: function(_, rps) {
        // console.log('*** rps: ', rps);
        this.rpsHistory = this.rpsHistory.pushF(this.rps);
      }
    },
    {
      type: 'Array',
      name: 'rpsHistory',
      label: '',
      view: { factory_: 'foam.graphics.Graph', width: 1000, height: 60 }
    },
    {
      name: 'strategy',
      view: { factory_: 'foam.ui.ChoiceView', choices: [ 'Standard', 'FOAM' ] }
    },
    {
      type: 'Array',
      name: 'dao',
      label: 'FOAM',
      view: 'TextAreaDAOView',
      factory: function() { return []; }
    },
    {
      type: 'Array',
      name: 'dao2',
      label: 'Standard',
      view: 'StandardTextAreaDAOView',
      factory: function() { return []; }
    }
  ],

  actions: [
    {
      name: 'test',
      code: function() {
        var dao = this.strategy === 'FOAM' ? this.dao : this.dao2;
        var startTime = Date.now();
        for ( var i = 0 ; i < 1000 ; i++ ) {
          if ( dao.length == this.maxRows ) { this.rows = dao.length; return; }
          var str = dao.length + ' ********************************* ' + new Date();
          dao.push(str);
          if ( this.strategy === 'Standard' || i === 999 ) dao.notify_('put', [str]);
        }
        var endTime = Date.now();
        this.rps = 100000 / (endTime - startTime);
        this.rows = dao.length;
        this.X.setTimeout(this.test.bind(this), 0);
      }
    }
  ]
});
