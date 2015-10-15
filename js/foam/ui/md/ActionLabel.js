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
  package: 'foam.ui.md',
  name: 'ActionLabel',
  extends: 'foam.ui.SimpleView',

  properties: [
    'action',
    'data',
    {
      name: 'className',
      factory: function() {
        return 'actionLabel actionLabel-' + this.action.name;
      }
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        this.action.maybeCall(this.X, this.data, e);
      }
    },
    {
      name: 'isAvailable',
      code: function() {
        return this.action.isAvailable.call(this.data, this.action);
      }
    },
    {
      name: 'isDisabled',
      code: function() {
        return ! this.action.isEnabled.call(this.data, this.action);
      }
    }
  ],

  templates: [
    function toHTML() {/*<i id="%%id" <%= this.cssClassAttr() %>>{{this.action.label}}</i><%
        this.on('click', this.onClick, this.id);
        this.setClass('available', this.isAvailable, this.id);
        this.setClass('disabled', this.isDisabled, this.id);%>*/}
  ]
});
