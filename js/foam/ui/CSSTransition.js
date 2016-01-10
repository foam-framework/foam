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
  package: 'foam.ui',
  name: 'CSSTransition',

  requires: [
    'foam.ui.CSSFunction',
    'foam.ui.CSSTime',
  ],

  properties: [
    {
      type: 'String',
      name: 'property',
      defaultValue: 'all',
      required: true,
    },
    {
      name: 'duration',
      defaultValue: null,
    },
    {
      name: 'timingFunction',
      defaultValue: null,
    },
    {
      name: 'delay',
      defaultValue: null,
    },
    {
      name: 'regExStr',
      lazyFactory: function() {
        var t = this.CSSTime.create().REG_EX_STR;
        var f = this.CSSFunction.create().regExStr;
        return '([a-zA-Z_-]+)\\s*(' + t + ')\\s*(' + f + ')?' + '(' + t + ')?';
      },
    },
  ],

  methods: [
    function fromString(s) {
      var match = this.fromString_(s);
      if ( ! match ) return null;
      this.property = match[1];
      this.duration = this.CSSTime.create().fromString(match[2]);
      this.timingFunction = this.CSSFunction.create().fromString(match[7]);
      return this;
    },
    function fromString_(s) {
      var re = new RegExp('^' + this.regExStr + '$', 'gi');
      return re.exec(s);
    },
    function toString() {
      var seq = [this.property.toString(), this.duration.toString()];
      if ( this.timingFunction ) seq.push(this.timingFunction.toString());
      if ( this.delay ) seq.push(this.delay.toString());
      return seq.join(' ');
    },
  ],
});
