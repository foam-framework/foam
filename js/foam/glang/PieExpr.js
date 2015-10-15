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
  package: 'foam.glang',
  name: 'PieExpr',
  extends: 'GroupByExpr',

  requires: [ 'foam.graphics.PieGraph' ],

  properties: ['graph_'],

  methods: {
    toCView: function() {
      if ( ! this.graph_ ) {
        this.graph_ = this.PieGraph.create({groups: this.groups, r: 50, x: 0});
        this.graph_.copyFrom(this.opt_args);
      }
      return this.graph_;
    },
    toView_: function() {
      return this.toCView().toView_();
    },
    toHTML: function() {
      return this.toView_().toHTML();
    },
    write: function(opt_X) {
      var X = opt_X || this.X;
      X.writeView(this.toView_(), X);
    },
    put: function(obj) {
      this.SUPER.apply(this, arguments);
      if ( this.graph_ ) {
        this.graph_.groups = this.groups;
        this.graph_.paint();
      }
    },
    remove: function() {
      this.SUPER.apply(this, arguments);
      this.graph_ && this.graph_.paint();
    },
    exprClone: function() {
      return this.model_.create({
        arg1: this.arg1,
        arg2: this.arg2.exprClone(),
        opt_args: this.opt_args
      });
    }
  }
});
