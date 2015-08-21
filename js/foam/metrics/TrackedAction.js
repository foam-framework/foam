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
  extendsModel: 'Action',

  requires: [
    'foam.metrics.Event',
  ],
  imports: [
    'metricsDAO',
  ],

  methods: [
    function maybeCall(X, that) {
      if ( ! this.SUPER(X, that) ) return false;
      X.metricsDAO && X.metricsDAO.put(this.Event.create({
        name: 'Action:' + this.name,
        label: (that.model_.id || that.name_),
      }));
      return true;
    },
  ],
});
