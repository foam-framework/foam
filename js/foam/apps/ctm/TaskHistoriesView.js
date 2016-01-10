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
  package: 'foam.apps.ctm',
  name: 'TaskHistoriesView',
  extends: 'foam.ui.SimpleView',

  requires: [ 'foam.apps.ctm.History' ],

  properties: [
    {
      // type: 'foam.apps.ctm.TaskController',
      name: 'data',
      postSet: function(old, nu) { this.updateHTML(); }
    },
    {
      type: 'StringArray',
      name:  'properties'
    }
  ],

  methods: [
    function toHTML() {
      var head = '<task-histories id="' + this.id + '">';
      var foot = '</task-histories>';
      var body = this.toInnerHTML();
      return head + body + foot;
    },
    function toInnerHTML() {
      if ( ! this.data ) return '';

      this.children = [];
      var i;
      for ( i = 0; i < this.properties.length; ++i ) {
        var propName = this.properties[i];
        if ( this.History.isInstance(this.data[propName]) ) {
          this.createTemplateView(propName);
        }
      }

      var str = '';
      for ( i = 0; i < this.children.length; ++i ) {
        str += this.children[i].toHTML();
      }
      return str;
    },
    function updateHTML() {
      if ( ! this.$ ) return;
      this.$.innerHTML = this.toInnerHTML();
      this.initHTML();
    }
  ]
});
