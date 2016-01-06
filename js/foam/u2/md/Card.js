/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.u2.md',
  name: 'Card',
  extends: 'foam.u2.Element',

  properties: [
    {
      type: 'Boolean',
      name: 'padding',
      documentation: 'Controls the padding inside the card. If your delegate ' +
          'wants to occupy the whole card, set this to false. (Corresponds ' +
          'to the old md-card-shell class.)',
      defaultValue: true
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls())
          .enableCls(this.myCls('shell'), this.padding$, true /* negate */);
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        background: #fff;
        display: block;
        margin: 10px;
        overflow: hidden;
        padding: 24px 16px;
      }
      ^shell {
        padding: 0;
      }

      @media not print {
        ^ {
          border-radius: 3px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        }
      }
      @media print {
        ^ {
          border: 6px double #000;
          margin: 6pt;
          page-break-inside: avoid;
        }
      }

      @media (max-width: 600px) {
        ^shell {
          margin: 0;
        }
      }
    */}
  ]
});
