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
  name: 'KeyView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'dao',
      factory: function() {
        if (!this.subType) return undefined;
        var basename = this.subType.split('.').pop();
        var lowercase = basename[0].toLowerCase() + basename.substring(1);
        return this.X[lowercase + 'DAO'] || this.X[basename + 'DAO'];
      }
    },
    { name: 'mode' },
    {
      name: 'data',
      postSet: function(_, value) {
        var self = this;
        var subKey = this.X.lookup(this.subType + '.' + this.subKey);
        var sink = { put: function(o) { self.innerData = o; } };
        if ( subKey.name === 'id' ) this.dao.find(value, sink);
        else this.dao.where(EQ(subKey, value)).limit(1).select(sink);
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
      defaultValue: 'foam.ui.DetailView'
    },
  ],

  methods: {
    toHTML: function() {
      this.children = [];
      var view = this.innerView({
        id: this.id,
        model: this.model,
        mode: this.mode,
        data$: this.innerData$
      });
      this.addChild(view);
      return view.toHTML();
    }
  }
});
