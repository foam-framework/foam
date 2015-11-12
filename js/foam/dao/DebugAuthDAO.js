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
  package: 'foam.dao',
  name: 'DebugAuthDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    function find(id, sink, opt_X) {
      this.delegate.find(id, sink, (opt_X || this.Y).sub({
        principal: (opt_X || this.Y).authHeader,
      }));
    },
    function put(obj, sink, opt_X) {
      this.delegate.put(obj, sink, (opt_X || this.Y).sub({
        principal: (opt_X || this.Y).authHeader,
      }));
    },
    function remove(id, sink, opt_X) {
      this.delegate.remove(id, sink, (opt_X || this.Y).sub({
        principal: (opt_X || this.Y).authHeader,
      }));
    },
    function select(sink, options, opt_X) {
      return this.delegate.select(sink, options, (opt_X || this.Y).sub({
        principal: (opt_X || this.Y).authHeader,
      }));
    },
    function removeAll(sink, options, opt_X) {
      return this.delegate.removeAll(sink, options, (opt_X || this.Y).sub({
        principal: (opt_X || this.Y).authHeader,
      }));
    },
  ],
});
