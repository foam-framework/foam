/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'CalcButton',
  package: 'foam.apps.calc',
  extends: 'foam.graphics.ActionButtonCView',
  properties: [
    {
      name: 'color',
      defaultValue: 'white'
    },
    {
      name: 'background',
      defaultValue: '#4b4b4b'
    },
    {
      name: 'width',
      defaultValue: 60
    },
    {
      name: 'height',
      defaultValue: 60
    },
    {
      name: 'font',
      defaultValue: '300 28px Roboto'
    },
    {
      name: 'role',
      defaultValue: 'button'
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      setTimeout(function() { this.view.paint(); }.bind(this), 1000);
    },
    toView_: function() {
      var v = this.SUPER();
      return v.decorate('toHTML', function(SUPER) { return '<div class="button">' + SUPER.call(this) + '</div>';}, v.toHTML);
    }
  }
});
