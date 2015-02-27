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
  name: 'Element',
  package: 'foam.flow',
  extendsModel: 'View',

  constants: { ELEMENT: 'flow-element' },

  methods: {
    installInDocument: function(X, document) {
      this.SUPER.apply(this, arguments);
      this.X.registerElement(this.ELEMENT, this.model_.package + '.' + this.name_);
    }
  }
});
