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
  package: 'foam.testing',
  name: 'WebRunner',
  extends: 'foam.ui.View',
  requires: [
    'foam.core.bootstrap.BrowserFileDAO',
    'foam.core.dao.OrDAO',
    'foam.ui.DAOListView',
  ],
  imports: [
    'document',
    'setTimeout',
  ],
  properties: [
    {
      type: 'StringArray',
      name: 'targets',
      adapt: function(_, a) {
        if ( typeof a === 'string' ) return a.split(',');
        if ( Array.isArray(a) ) return a;
        return [];
      },
      factory: function() {
        // If nothing was provided, try fetching these from the query string.
        var query = this.document.location.search;
        var match = query.match(/targets=([^&]*)/);
        return match ? match[1] : [];
      },
    },
    {
      type: 'Boolean',
      name: 'allPassed'
    },
    {
      type: 'Boolean',
      name: 'finished',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.DOMElementProperty',
      name: 'logEl',
    },
  ],
  methods: {
    init: function(args){
      this.SUPER(args);
      this.logEl = this.id + '-log';
      this.X.ModelDAO = this.OrDAO.create({
        primary: this.BrowserFileDAO.create({ // Try the test/ subdir first.
          rootPath: 'test/'
        }),
        delegate: this.OrDAO.create({
          primary: this.BrowserFileDAO.create({
            rootPath: 'js/'   // Then try js/ for the main app.
          }),
          delegate: this.X.ModelDAO, // Finally fall back on FOAM core.
        })
      });
    },
    appendLog: function(msg, extraClasses) {
      this.logEl.insertAdjacentHTML('beforeend',
          '<span class="log ' + extraClasses + '">' + msg + '</span>');
    },
    initHTML: function() {
      this.SUPER();
      this.setTimeout(function() { this.execute(); }.bind(this), 10);
    },
    execute: function() {
      // Always declare a test failure unless we get to the end of the test
      // runs and they all passed.
      this.finished = false;
      var seq = [];
      this.logEl.innerHTML = '';

      if ( ! this.targets.length ) {
        this.warn('No test targets requested.');
        this.finished = true;
        return;
      }

      for ( var i = 0 ; i < this.targets.length ; i++ ) {
        seq.push(this.X.arequire(this.targets[i]));
      }


      this.allPassed = true;
      var tests = [];

      try {
      aseq(
        aseq.apply(null, seq),
        function(ret) {
          var seq = [];
          for ( var i = 0 ; i < this.targets.length ; i++ ) {
            seq.push((function(model) {
              if ( ! model ) {
                this.error('Could not load target: ' + this.targets[i]);
                this.allPassed = false;
                return anop;
              }

              return aseq(
                function(ret) {
                  tests = tests.concat(model.tests);
                  ret();
                },
                model.atest(),
                function(ret, passed) {
                  if ( ! passed ) this.allPassed = false;
                  for ( var i = 0 ; i < model.tests.length ; i++ ) {
                    var s = '<div class="test-result ' +
                        (model.tests[i].hasFailed() ? 'failing' : 'passing') + '">';
                    s += '<div class="test-result-header">Test Case: ' +
                        model.tests[i].name + '</div>';
                    s += model.tests[i].results.replace(/\n/g, '<br/>');
                    s += '</div>';
                    this.log(s);
                  }
                  ret();
                }.bind(this));
            }.bind(this))(this.X.lookup(this.targets[i])));
          }
          if ( ! seq.length ) ret();
          else aseq.apply(null, seq)(ret);
        }.bind(this)
      )(function() {
        this.finished = true;
      }.bind(this));
      } catch(e)  { this.error('Error: ' + e.stack); }
    }
  },
  listeners: [
    {
      name: 'log',
      code: function(msg) {
        this.appendLog(msg, '');
      }
    },
    {
      name: 'warn',
      code: function(msg) {
        this.appendLog(msg, 'warning');
      }
    },
    {
      name: 'error',
      code: function(msg) {
        this.appendLog(msg, 'error');
      }
    },
  ],

  templates: [
    function CSS() {/*
      body {
        margin: 0;
        padding: 0;
      }
      .test-header {
        background-color: #e0e0e0;
        margin: 0;
        padding: 20px;
        font-size: 24px;
        font-weight: bold;
      }

      .test-header.passing {
        background-color: #00da00;
        color: #fff;
      }
      .test-header.failing {
        background-color: red;
        color: #fff;
      }
      .log {
        display: block;
      }

      .test-result {
        border: 1px solid black;
        margin: 10px;
        padding: 6px;
      }
      .test-result.passing {
        background-color: #dfd;
      }
      .test-result.failing {
        background-color: #fdd;
      }

      .test-result-header {
        font-weight: bold;
        margin-bottom: 6px;
      }
    */},
    function toHTML() {/*
      <div class="test-results">
        <div id="<%= this.id %>-header" class="test-header">
          Testing %%targets
        </div>
        <% this.setClass('passing',
            function(){ self.allPassed; return self.finished && self.allPassed; },
            this.id + '-header'); %>
        <% this.setClass('failing',
            function(){ self.allPassed; return self.finished && !self.allPassed; },
            this.id + '-header'); %>
        <div id="<%= this.id %>-log" class="test-log">
        </div>
      </div>
    */}
  ],
});
