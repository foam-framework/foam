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

MODEL({
  package: 'foam.apps.calc',
  name: 'Binary',
  extends: 'foam.apps.calc.Unary',
  properties: [
    [ 'code', function(_, action) {
      if ( this.a2 == '' ) {
        // the previous operation should be replaced, since we can't
        // finish this one without a second arg. The user probably hit one
        // binay op, followed by another.
        this.replace(action.f);
      } else {
        if ( this.op != this.model_.DEFAULT_OP ) this.equals();
        this.push('', action.f);
        this.editable = true;
      }
    }],
    {
      name: 'label',
      defaultValueFn: function() { return this.name; }
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.f.unary = false;
      this.f.binary = true;
    }
  ]
});
