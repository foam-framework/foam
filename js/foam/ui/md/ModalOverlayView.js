
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
  name: 'ModalOverlayView',
  package: 'foam.ui.md',
  extends: 'foam.flow.Element',

  exports: [ 'as overlay' ],

  constants: { ELEMENT_NAME: 'modal-overlay' },

  properties: [
    {
      type: 'String',
      name: 'cssPosition',
      defaultValue: 'fixed',
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.style.position = this.cssPosition;
      }
    },
    {
      type: 'Float',
      name: 'openAlpha',
      defaultValue: 0.4
    },
    {
      type: 'Float',
      name: 'alpha',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.style.opacity = this.alpha;
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.$.style.position = this.cssPosition;
        this.$.style.opacity = this.alpha;
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* */},
    function CSS() {/*
      modal-overlay {
        position: fixed;
        display: block;
        z-index: 100;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        background-color: #000000;
        opacity: 0.4;
      }
    */}
  ]
});
