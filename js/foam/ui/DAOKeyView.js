/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.ui',
  name: 'DAOKeyView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'dao',
      factory: function() {
        if (!this.subType) return undefined;
        var basename = this.subType.split('.').pop();
        // TODO: camelize()
        var lowercase = basename[0].toLowerCase() + basename.substring(1);
        return this.X[lowercase + 'DAO'] || this.X[basename + 'DAO'];
      }
    },
    { name: 'mode' },
    {
      name: 'data',
      postSet: function(_, value) {
        var subKey = this.X.lookup(this.subType + '.' + this.subKey);
        this.innerData = this.dao.where(IN(subKey, value));
      }
    },
    {
      name: 'innerData',
    },
    { name: 'subType' },
    {
      name: 'model',
      defaultValueFn: function() { return this.X.lookup(this.subType); }
    },
    { name: 'subKey' },
    {
      type: 'ViewFactory',
      name: 'innerView',
      defaultValue: 'foam.ui.DAOListView'
    },
    'dataView'
  ],

  methods: {
    toHTML: function() {
      this.destroy();
      var view = this.innerView({
        model: this.model,
        mode: this.mode,
        data$: this.innerData$
      });
      this.addChild(view);
      return view.toHTML();
    }
  }
});
