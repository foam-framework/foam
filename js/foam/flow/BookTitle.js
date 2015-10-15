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
  extends: 'foam.flow.Element',

  templates: [
    function CSS() {/*
      @media not print {

        @media (max-width: 800px) {

          book-title {
            font-weight: bold;
            font-size: 40px;
            margin-top: 15px;
          }

        }

        @media (min-width: 800px) {

          book-title {
            font-weight: bold;
            font-size: 50px;
            margin-top: 20px;
          }

        }

      }

      @media print {

        book-title {
          font-weight: bold;
          font-size: 32pt;
          margin-top: 1in;
        }

      }
    */}
  ]
});
