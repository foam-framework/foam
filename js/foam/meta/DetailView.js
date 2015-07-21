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
  name: 'DetailView',
  package: 'foam.meta',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.TableView',
    'Model',
    'Property',
    'foam.meta.PropertyView as PropertyView',
  ],

  properties: [
    {
      name: 'metaPriority',
      help: 'Specifies the highest metaPriority to show. Properties with higher metaPrioritys are hidden.',
      defaultValue: 0,
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // nested DetailViews become meta
      this.Y.registerModel(this.model_, 'foam.ui.DetailView');
    },

    function getDefaultProperties() {
      var props = this.model.getRuntimeProperties();
      var ret = [];
      for (var i = 0; i < props.length; ++i) {
        var p = props[i];
        if ( p.metaPriority <= this.metaPriority ) ret.push(p);
      }
      return ret;
    },
  ],

});

