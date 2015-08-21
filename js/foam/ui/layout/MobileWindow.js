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
  name: 'MobileWindow',
  package: 'foam.ui.layout',
  extendsModel: 'foam.ui.layout.Window',
  methods: {
    init: function(args) {
      this.SUPER(args);
      this.window.document.head.insertAdjacentHTML('afterbegin',
          '<meta name="viewport" content="initial-scale=1.0, ' +
          'width=device-width, user-scalable=no">');
    }
  }
});
