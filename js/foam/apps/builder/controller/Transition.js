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
  package: 'foam.apps.builder.controller',
  name: 'Transition',

  documentation: function() {/* Reusable view transition controller for
    attaching a particular transition strategy to any number of controlled
    views. Transition controllers listen for events from a higher-level
    controller to determine when to trigger add/remove/resize transitions.
    They publish added/removed/resized events when the associated transition
    completes. A single transition controller can be attached to / detached from
    a view by passing a view, higher-level controller, and event topic id to
    $$DOC{ref:'.attach'} / $$DOC{ref:'.detach'}. */},

  properties: [
    'id',
    {
      type: 'Function',
      name: 'onAdd',
      args: [
        { name: 'ret', documentation: 'Callback when transition complete' },
        { name: 'view', documentation: 'View to be manipualted' },
        { name: 'hints', documentation: 'Layout hints for view' },
      ],
    },
    {
      type: 'Function',
      name: 'onRemove',
      args: [
        { name: 'ret', documentation: 'Callback when transition complete' },
        { name: 'view', documentation: 'View to be manipualted' },
        { name: 'hints', documentation: 'Layout hints for view' },
      ],
    },
    {
      type: 'Function',
      name: 'onResize',
      args: [
        { name: 'ret', documentation: 'Callback when transition complete' },
        { name: 'view', documentation: 'View to be manipualted' },
        { name: 'hints', documentation: 'Layout hints for view' },
      ],
    },
    {
      name: 'bindings_',
      lazyFactory: function() { return {}; },
    },
  ],

  methods: [
    {
      name: 'attach',
      documentation: function() {/* Attach my transition strategy to
        $$DOC{ref:'view'} by listening for events from controller,
        $$DOC{ref:'ctlr'}. Listen to controller events on topics containing
        $$DOC{ref:'id'}. */},
      code: function(view, ctlr, id) {
        if ( this.bindings_[ctlr.id] &&
            this.bindings_[ctlr.id][view.id] )
          this.detach(view, ctlr);

        var bindings = { id: id };
        var bindListener = this.bindListener_.bind(this, view, ctlr, bindings);
        bindListener('add', this.onAdd, ['add', id]);
        bindListener('remove', this.onRemove, ['remove', id]);
        bindListener('resize', this.onResize, ['resize', id]);

        if ( ! this.bindings_[ctlr.id] ) this.bindings_[ctlr.id] = {};
        this.bindings_[ctlr.id][view.id] = bindings;
      },
    },
    {
      name: 'detach',
      documentation: function() {/* Attach my transition strategy from
        $$DOC{ref:'view'} by unlistening to events from controller,
        $$DOC{ref:'ctlr'} on topics containing $$DOC{ref:'id'}. */},
      code: function(view, ctlr) {
        if ( ! (this.bindings_[ctlr.id] &&
            this.bindings_[ctlr.id][view.id]) ) return;
        var bindings = this.bindings_[ctlr.id][view.id];
        if ( bindings.add )
          ctlr.unsubscribe(['add', bindings.id], bindings.add);
        if ( bindings.remove )
          ctlr.unsubscribe(['remove', bindings.id], bindings.remove);
        if ( bindings.resize )
          ctlr.unsubscribe(['resize', bindings.id], bindings.resize);
        delete this.bindings_[ctlr.id][view.id];
        // TODO(markdittmer): Check for empty this.bindings_[ctlr.id] and
        // clean up?
      },
    },
    function bindListener_(view, ctlr, bindings, key, fn, topic) {
      var bound = bindings[key] = function(ctlr, topic) {
        if ( fn ) {
          // Topic = [operation, id, hints].
          // Invoke this.onEventType(ret, view, hints).
          fn.call(this,
                  this.notifyCompleted_.bind(this, topic[0], topic[1]),
                  view, topic[2]);
        } else {
          // No transition defined; notify transition complete.
          this.notifyCompleted_(topic[0], topic[1]);
        }
      }.bind(this);
      ctlr.subscribe(topic, bound);
      return bindings;
    },
    function notifyCompleted_(action, id) {
      var pastTense = action.charAt(action.length - 1) === 'd' ?
          action + 'ed' :
          action + 'd';
      this.publish([pastTense, id]);
    },
  ],
});
