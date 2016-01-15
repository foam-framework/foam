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
  package: 'foam.apps.builder',
  name: 'TrackLaunchCloseTrait',

  requires: [
  ],
  imports: [
    'onWindowClosed',
    'performance',
  ],
  exports: [
  ],

  properties: [
    {
      type: 'Int',
      name: 'launchTime',
      lazyFactory: function() { return this.getCurrentTime(); },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.metricsDAO && this.metricsDAO.put(this.Metric.create({
        name: 'launchApp',
        value: this.launchTime,
      }, this.Y));
      this.onWindowClosed && this.onWindowClosed(this.onAppWindowClosed);
    },
    function getCurrentTime() {
      return (this.performance && this.performance.now) ?
          Math.round(this.performance.now() / 1000) : 0;
    },
  ],

  listeners: [
    {
      name: 'onAppWindowClosed',
      code: function() {
        var closeTime = this.getCurrentTime();
        this.metricsDAO.put(this.Metric.create({
          name: 'openTime',
          value: closeTime - this.launchTime,
        }, this.Y));
        this.metricsDAO.put(this.Metric.create({
          name: 'closeApp',
          value: closeTime,
        }, this.Y));
      }
    },
  ],
});
