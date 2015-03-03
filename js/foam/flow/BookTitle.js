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
  name: 'BookTitle',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  templates: [
    function toHTML() {/*
      <flow-book-title id="%%id"><%= this.inner() %></flow-book-title>
    */},
    function CSS() {/*
      @media not print {

        @media (max-width: 800px) {

          flow-book-title {
            font-weight: bold;
            font-size: 70px;
            margin-top: 15px;
          }

        }

        @media (min-width: 800px) {

          flow-book-title {
            font-weight: bold;
            font-size: 80px;
            margin-top: 20px;
          }

        }

      }

      @media print {

        flow-book-title {
          font-weight: bold;
          font-size: 32pt;
          margin-top: 1in;
        }

      }
    */}
  ]
});
