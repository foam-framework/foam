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
  name: 'FBEViews',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  templates: [
    { name: 'toInnerHTML' },
    function CSS() {/* fbe-views { display: block; } */}
  ]
});
