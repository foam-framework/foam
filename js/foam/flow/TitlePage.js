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
  name: 'TitlePage',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  templates: [
    function CSS() {/*
      title-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      title-page > * {
        display: block;
      }

      @media print {

        title-page {
          page-break-after: always;
        }

      }
    */}
  ]
});
