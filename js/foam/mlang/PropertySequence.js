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
  package: 'foam.core.types',
  name: 'PropertySequence',
  extends: 'Property',

  properties: [
    {
      name: 'id',
      getter: function() {
        return this.name + (this.next_ ? '.' + this.next_.id : '');
      },
    },
    {
      type: 'Property',
      name: 'next_',
      defaultValue: null,
    },
  ],

  methods: [
    function partialEval() { return this; },
    function f(obj) {
      var i;
      var p = this;
      while ( p.next_ ) {
        if ( ! obj ) return obj;
        obj = obj[p.name];
        p = p.next_;
      }
      if ( ! obj ) return obj;
      return obj[constantize(p.name)].f(obj);
    },
  ],
});

// Install property-continuation-property when this model is loaded (even if no
// instances are created yet).
// TODO(markdittmer): This won't work in packaged apps.
(function() {
  // Property Continuation Property Name.
  var PCP_NAME = 'dot';
  var Property = this.X.lookup('Property');
  if ( Property.getProperty(PCP_NAME) ) return;

  var PropertySequence = this.X.lookup('foam.core.types.PropertySequence');
  // Property Continuation Property.
  var pcp = Property.create({
    name: PCP_NAME,
    labels: ['javascript'],
    defaultValue: function(nextProp) {
      if ( PropertySequence.isInstance(this) ) {
        if ( this.next_ ) this.next_ = this.next_[PCP_NAME](nextProp);
        else              this.next_ = nextProp;
        return this;
      } else {
        return PropertySequence.xbind({ next_: nextProp }).create(this, this.Y);
      }
    },
  });
  Property.properties.push(pcp);
  Property.getPrototype().defineProperty(pcp);
})();
