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
  name: 'SubTitle',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  templates: [
    function CSS() {/*
      @media not print {

        @media (max-width: 800px) {

          sub-title {
            margin: 5px;
            font-size: 30px;
          }

        }

        @media (min-width: 800px) {

          sub-title {
            margin: 10px;
            font-size: 40px;
          }

        }

      }

      @media print {

        sub-title {
          margin-top: 0.5in;
          font-size: 24pt;
        }

      }
    */}
  ]
});
