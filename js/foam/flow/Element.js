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
  package: 'foam.flow',
  name: 'Element',
  extends: 'foam.ui.View',

  requires: [
    'foam.Name'
  ],

  properties: [
    {
      type: 'ViewFactory',
      name: 'inner'
    },
    {
      model_: 'foam.core.types.DocumentInstallProperty',
      name: 'registerElement',
      documentInstallFn: function(X) {
        X.registerElement(
            this.getTagName(X),
            this.model_.package + '.' + this.name_);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.tagName = this.getTagName();
    },

    getTagName: function(X) {
      if ( this.ELEMENT_NAME ) return this.ELEMENT_NAME;
      var Name = this.X.lookup('foam.Name');
      if ( Name ) return Name.create({ initial: this.name_ },
                                     X || this.X).toTagName();
      return 'foam-flow-element';
    },

    replaceAll: function(str, a, b) {
      var next = str, prev = '';
      while ( prev !== next) {
        prev = next;
        next = next.replace(a, b);
      }
      return next;
    },

    /** Allow inner to be optional when defined using HTML. **/
    fromElement: function(e) {
      // Import nodes that model properties.
      this.SUPER(e);
      // Remove nodes that model properties.
      if ( e.children.length !== 1 || e.children[0].nodeName !== 'inner' ) {
        var childrenToRemove = [];
        for ( var i = 0 ; i < e.children.length ; i++ ) {
          var child = e.children[i];
          var properties = this.model_.getRuntimeProperties();
          for ( var j = 0 ; j < properties.length ; j++ ) {
            var prop = properties[j];
            if ( child.nodeName === prop.name ) {
              childrenToRemove.push(child);
              break;
            }
          }
        }
        for ( i = 0 ; i < childrenToRemove.length ; i++ ) {
          e.removeChild(childrenToRemove[i]);
        }
        this.inner = e.innerHTML;
      }
      return this;
    }
  },

  templates: [
    function toInnerHTML() {/*<%= this.inner() %>*/}
  ],
});
