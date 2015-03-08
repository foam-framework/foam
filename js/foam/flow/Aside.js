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
  name: 'Aside',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  templates: [
    function CSS() {/*
      aside {
        background: #fff;
        padding: 10px;
        margin: 0px 10px 10px 10px;
        right: 10px;
        float: right;
        position: relative;
      }

      aside p {
        width: initial;
      }

      @media not print {

        aside {
          box-shadow: 5px 5px 20px #888;
          margin: 8px;
        }

        @media (max-width: 800px) {

          aside {
            width: 50%;
          }

        }

        @media (min-width: 800px) {

          aside {
            min-width: 300px;
            max-width: 25%;
            border: 0px;
          }

        }

      }

      @media print {

        aside {
          width: 50%;
          border: 6px double #000;
          margin: 6pt;
          page-break-inside: avoid;
        }

      }
    */}
  ]
});
