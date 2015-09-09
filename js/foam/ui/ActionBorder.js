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
  package: 'foam.ui',
  name: 'ActionBorder',

  documentation: function() {/*
    Add Action Buttons to a decorated View.</p><p>
     TODO:
       These are left over Todo's from the previous ActionBorder, not sure which still apply.

       The view needs a standard interface to determine it's Model (getModel())
       listen for changes to Model and change buttons displayed and enabled
       isAvailable.
  */},

  methods: {
    toHTML: function(border, delegate, args) {
      var str = "";
      str += delegate.apply(this, args);
      str += '<div class="actionToolbar">';

      // Actions on the View, are bound to the view
      var actions = this.model_.getRuntimeActions();
      for ( var i = 0 ; i < actions.length; i++ ) {
        var v = this.createActionView(actions[i]);
        //v.data = this;
        this.addSelfDataChild(v);
        str += ' ' + v.toView_().toHTML() + ' ';
      }

      // This is poor design, we should defer to the view and polymorphism
      // to make the distinction.
      if ( this.X.lookup('foam.ui.DetailView').isInstance(this) ) {

        // Actions on the data are bound to the data
        actions = this.model.actions;
        for ( var i = 0 ; i < actions.length; i++ ) {
          var v = this.createActionView(actions[i]);
          //v.data$ = this.data$;
          this.addDataChild(v);
          str += ' ' + v.toView_().toHTML() + ' ';
        }
      }

      str += '</div>';
      return str;
    }
  }
});
