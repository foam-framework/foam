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
  package: 'foam.metrics',
  name: 'TrackedAction',
  extends: 'Action',

  requires: [
    'foam.metrics.Event',
  ],
  imports: [
    'metricsDAO',
  ],

  properties: [
    {
      type: 'String',
      name: 'trackingName',
      defaultValueFn: function() { return this.name; },
    },
    {
      type: 'Function',
      name: 'trackingNameFn',
      defaultValue: function(X, that) { return this.trackingName; },
    },
  ],

  methods: [
    function maybeCall(X, that) {
      if ( ! this.SUPER(X, that) ) return false;
      X.metricsDAO && X.metricsDAO.put(this.Event.create({
        name: 'Action:' + this.trackingNameFn(X, that),
        label: (that.model_.id || that.name_),
      }));
      return true;
    },
  ],
});
