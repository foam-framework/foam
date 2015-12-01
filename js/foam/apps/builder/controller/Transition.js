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

  properties: [
    'id',
    {
      model_: 'FunctionProperty',
      name: 'onPush',
      args: [
        { name: 'view', documentation: 'View to be manipualted' },
        { name: 'hints', documentation: 'Layout hints for view' },
      ],
    },
    {
      model_: 'FunctionProperty',
      name: 'onPop',
      args: [
        { name: 'view', documentation: 'View to be manipualted' },
        { name: 'hints', documentation: 'Layout hints for view' },
      ],
    },
    {
      model_: 'FunctionProperty',
      name: 'onResize',
      args: [
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
    function onPop_(view, hints) {
      if ( ! (hints && hints.controller) ) {
        console.warn('Transition onPop invoked without "controller" hint; ' +
            'unable to unsubscribe from controller events');
      } else {
        this.detach(view, hints.controller);
      }
      return this.onPop(view, hints);
    },
    function maybeBind(view, ctlr, bindings, key, fn, topic) {
      if ( ! fn ) return bindings;
      var bound = bindings[key] = function(ctlr, topic) {
        // Topic = [operation, id, hints].
        // Invoke this.onEventType(view, hints).
        fn.call(this, view, topic[2]);
      }.bind(this);
      ctlr.subscribe(topic, bound);
      return bindings;
    },
    function attach(view, ctlr, id) {
      if ( this.bindings_[ctlr.id] &&
          this.bindings_[ctlr.id][view.id] )
        this.detach(view, ctlr);

      var bindings = { id: id };
      var maybeBind = this.maybeBind.bind(this, view, ctlr, bindings);
      maybeBind('push', this.onPush, ['push', id]);
      maybeBind('pop', this.onPop ? this.onPop_ : null, ['pop', id]);
      maybeBind('resize', this.onResize, ['resize', id]);

      if ( ! this.bindings_[ctlr.id] ) this.bindings_[ctlr.id] = {};
      this.bindings_[ctlr.id][view.id] = bindings;
    },
    function detach(view, ctlr) {
      if ( ! (this.bindings_[ctlr.id] &&
        this.bindings_[ctlr.id][view.id]) ) return;
      var bindings = this.bindings_[ctlr.id][view.id];
      if ( bindings.push )
        ctlr.unsubscribe(['push', bindings.id], bindings.push);
      if ( bindings.pop )
        ctlr.unsubscribe(['pop', bindings.id], bindings.pop);
      if ( bindings.resize )
        ctlr.unsubscribe(['resize', bindings.id], bindings.resize);
      delete this.bindings_[ctlr.id][view.id];
      // TODO(markdittmer): Check for empty this.bindings_[ctlr.id] and
      // clean up?
    },
  ],
});
