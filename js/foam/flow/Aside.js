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
      aside, .aside {
        background: #fff;
        margin: 0px 10px 10px 10px;
        right: 10px;
        float: right;
        position: relative;
      }

      aside p, .aside p {
        width: initial;
      }

      @media not print {

        aside, .aside {
          box-shadow: 2px 2px 7px #aaa;
          margin: 8px;
          border: 0px;
          border-radius: 2px;
        }

        aside.wide {
          min-width: initial;
          max-width: initial;
        }

        @media (max-width: 800px) {

          aside, .aside {
            width: 50%;
          }

          aside.wide {
            float: none;
          }

        }

        @media (min-width: 800px) {

          aside, .aside {
            min-width: 300px;
            max-width: 25%;
          }

          aside.wide {
            width: 60%;
          }

        }

      }

      @media print {

        aside, .aside {
          width: 50%;
          border: 6px double #000;
          margin: 6pt;
          page-break-inside: avoid;
        }

        aside.wide {
          float: none;
          margin-left: 10pt;
        }

      }
    */}
  ]
});
