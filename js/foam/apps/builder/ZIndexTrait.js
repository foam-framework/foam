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
  name: 'ZIndexTrait',

  requires: [
  ],
  imports: [
  ],
  exports: [
  ],

  properties: [
    {
      type: 'Int',
      name: 'zIndex',
      defaultValue: 1,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style['z-index'] = nu;
      },
    },
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      if ( this.zIndex ) this.$.style['z-index'] = this.zIndex;
    },
  ],
});
