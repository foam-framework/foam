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
  name: 'Card',
  package: 'foam.ui.md',
  extendsModel: 'foam.flow.Element',

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate',
      defaultValue: 'foam.ui.md.CardTitle'
    },
    {
      name: 'delegateView'
    }
  ],

  methods: [
    {
      name: 'construct',
      code: function() {
        this.delegateView = this.delegate();
        this.addDataChild(this.delegateView);
        return this.SUPER.apply(this, arguments);
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      %%delegateView
    */},
    function CSS() {/*
      card, .card {
        display: block;
        background: #fff;
        margin: 10px;
        position: relative;
      }

      card p, .card p {
        width: initial;
      }

      @media not print {

        card, .card {
          box-shadow: 4px 4px 10px #000000;
          margin: 10px;
          border-radius: 2px;
        }

      }

      @media print {

        card, .card {
          border: 6px double #000;
          margin: 6pt;
          page-break-inside: avoid;
        }

      }
    */}
  ]
});
