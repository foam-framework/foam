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

  templates: [
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
          box-shadow: 2px 1px 2px #aaaaaa;
          margin: 0px 10px 10px 15px;
          border: 0px;
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
