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
  package: 'foam.u2',
  name: 'SearchBorder',
  extends: 'foam.u2.View',
  documentation: 'Wraps a view of a DAO to add filtering based on a search ' +
      'query. You can supply a $$DOC{ref:".queryParser"}, or use the default ' +
      '(KEYWORD).',

  imports: [
    'data',
  ],
  exports: [
    'filteredProxy_ as data',
  ],

  properties: [
    {
      name: 'data',
    },
    {
      name: 'queryParser',
      documentation: 'A query parser, or a function from string to EXPR.',
      defaultValue: function(s) { return KEYWORD(s); }
    },
    {
      name: 'delegate',
      documentation: 'An inner view that expects a DAO. Binds it to filtered_.',
      postSet: function(old, nu) {
        nu.data = this.filtered_$Proxy;
      },
    },
    {
      type: 'String',
      name: 'search',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.TextField').create({
          inline: true,
          onKey: true
        }, X);
      },
      postSet: function(old, nu) {
        this.query_ = !nu ? TRUE : this.queryParser.parseString ?
            this.queryParser.parseString(nu) : this.queryParser(nu);
      },
    },
    {
      name: 'query_',
      defaultValue: TRUE
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filtered_',
      dynamicValue: [function() {
        this.data; this.query_;
      }, function(data, query_) {
        return this.data.where(this.query_);
      }],
    },
    {
      name: 'filteredProxy_',
      factory: function() {
        return this.filtered_$Proxy;
      }
    },
  ],
  methods: [
    function initE() {
      this.cls(this.myCls()).add(this.delegate);
    },
  ],
  templates: [
    function CSS() {/*
      ^ {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
    */}
  ],
});
