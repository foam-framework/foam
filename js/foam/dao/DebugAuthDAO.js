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
      var X = opt_X && opt_X.sub ? opt_X : this.Y;
      this.delegate.find(id, sink, X.sub({
        principal: X.authHeader,
      }));
    },
    function put(obj, sink, opt_X) {
      var X = opt_X && opt_X.sub ? opt_X : this.Y;
      this.delegate.put(obj, sink, X.sub({
        principal: X.authHeader,
      }));
    },
    function remove(id, sink, opt_X) {
      var X = opt_X && opt_X.sub ? opt_X : this.Y;
      this.delegate.remove(id, sink, X.sub({
        principal: X.authHeader,
      }));
    },
    function select(sink, options, opt_X) {
      var X = opt_X && opt_X.sub ? opt_X : this.Y;
      return this.delegate.select(sink, options, X.sub({
        principal: X.authHeader,
      }));
    },
    function removeAll(sink, options, opt_X) {
      var X = opt_X && opt_X.sub ? opt_X : this.Y;
      return this.delegate.removeAll(sink, options, X.sub({
        principal: X.authHeader,
      }));
    },
  ],
});
