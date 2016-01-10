/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'VirtualConsole',
  package: 'foam.flow',
  todo: 'This isn\'t a FLOW view. It should probably live somewhere else.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.core.dao.ManuallyDelayedPutDAO',
    'foam.ui.DAOListView',
    'foam.flow.LogEntry',
    'foam.flow.LogEntryView'
  ],
  imports: [
    'console'
  ],

  properties: [
    {
      type: 'Int',
      name: 'counter',
      defaultValue: 0
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'console_',
      factory: function() {
        return this.EasyDAO.create({
          model: this.LogEntry,
          daoType: 'MDAO',
          seqNo: true
        });
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        tagName: 'console-log',
        rowView: 'foam.flow.LogEntryView'
      },
      postSet: function(old, nu) {
        if ( ! this.delayedConsole_ ) return;
        if ( nu !== this.delayedConsole_.delegate) this.delayedConsole_.delegate = nu;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'delayedConsole_',
      factory: function() {
        return this.ManuallyDelayedPutDAO.create({ delegate: this.console_ });
      }
    },
    {
      type: 'Boolean',
      name: 'delayPuts',
      documentation: function() {/* Controlled externally. Determines whether
        incoming console messages should be put straight to
        $$DOC{ref:'.console_'}, or delayed by putting to
        $$DOC{ref:'delayedConsole_'}. When transitioning from "true" to "false",
        delayed puts are released.
      */},
      defaultValue: false,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( ! nu ) this.delayedConsole_.join();
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.onLog.json = this.console.log.json;
        this.onWarn.json = this.console.warn.json;
        this.onError.json = this.console.error.json;
        this.onAssert.json = this.console.assert.json;

        window.debugVC = [];
      }
    },
    {
      name: 'watchConsole',
      code: function() {
        GLOBAL.console = {
          log: this.onLog,
          warn: this.onWarn,
          error: this.onError,
          assert: this.onAssert
        };
      }
    },
    {
      name: 'resetConsole',
      code: function() {
        GLOBAL.console = this.console;
      }
    },
    {
      name: 'putToConsole',
      documentation: function() {/* Always put to either the manually delayed
        DAO, or directly to the underlying DAO, according to
        $$DOC{ref:'.delayPuts'}.
      */},
      code: function(mode, args) {
        var arr = [];
        for ( var i = 0; i < args.length; ++i ) {
          arr.push(args[i].toString());
        }
        var str = arr.join(' ');

        var dao = this.delayPuts ? this.delayedConsole_ : this.console_;
        dao.put(this.LogEntry.create({
          id: ++this.counter,
          mode: mode,
          contents: str
        }));
      }
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() {
        this.console_.removeAll();
        this.counter = 0;
      }
    }
  ],

  listeners: [
    {
      name: 'onLog',
      code: function(o) {
        this.putToConsole('log', arguments);
        this.console.log.apply(this.console, arguments);
      }
    },
    {
      name: 'onWarn',
      code: function(o) {
        this.putToConsole('warn', arguments);
        this.console.warn.apply(this.console, arguments);
      }
    },
    {
      name: 'onError',
      code: function(o) {
        this.putToConsole('error', arguments);
        this.console.error.apply(this.console, arguments);
      }
    },
    {
      name: 'onAssert',
      code: function(cond, msg) {
        if ( ! cond ) {
          this.putToConsole('error', ['Assertion Failed: ' + msg]);
        }
        this.console.assert.apply(this.console, arguments);
      }
    }
  ]
});
