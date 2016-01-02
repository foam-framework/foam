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
  package: 'foam.demos.sevenguisu2',
  name: 'TempConv',
  label: 'Temperature Converter',
  properties: [
    { type: 'Float', name: 'c' },
    { type: 'Float', name: 'f' }
  ],
  templates: [
    // TODO: Outer <span> shouldn't be required.
    // TODO: x:data={{this}} shouldn't be required, use this:c instead
    // TODO: precision doesn't work
    // TODO: Whitespace should be preserved as a single character
    function toE() {/*#U2<span x:data={{this}}><:c onKeyMode="true" precision="4"/> Celsius = <:f onKeyMode="true" precision="4"/> Fahrenheit</span>*/}
  ],
  methods: [
    function init() { Events.relate(this.c$, this.f$, this.c2f, this.f2c); },
    function c2f(f) { return 9/5 * f + 32; },
    function f2c(c) { return 5/9 * ( c - 32 ); }
  ]
});
