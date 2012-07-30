/*
 * Copyright 2012 Google Inc. All Rights Reserved.
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

var StackView = FOAM.create({
   model_: 'Model',

   name:  'StackView',
   label: 'Stack View',

   extendsPrototype: 'AbstractView',

   properties: [
      {
	 name:  'stack',
	 label: 'Stack',
	 valueFactory: function() { return []; }
      },
      {
	 name:  'redo',
	 label: 'Redo',
	 valueFactory: function() { return []; }
      }
   ],

   actions: [
      {
         model_: 'ActionModel',
	 name:  'back',
	 label: 'Back',
	 help:  'Go to previous view',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() {
	    this.redo.push(this.stack.pop());
	    this.pushView(this.stack.pop());
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'forth',
	 label: '->',
	 help:  'Undo the previous back.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return true; },
	 action:      function() { }
      }
   ],

   methods: {
      toHTML: function() {
	 return '<div class="stackview" style="width:100%;font-size:200%;font-family:sans-serif" id="' + this.getID() + '">' +
	    '<div class="stackview_navbar"></div>' +
            '<table><tr><td valign=top><div class="stackview-viewarea" width:760px></div></td><td valign=top><div class="stackview_previewarea"></div></td></tr></table></div>';
      },

      setTopView: function (view, opt_label)
      {
	 this.stack = [];
	 this.pushView(view);
      },

      navBarElement: function ()
      {
	 return this.element().childNodes[0];
      },

      viewAreaElement: function ()
      {
	 return this.element().childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
      },

      previewAreaElement: function ()
      {
	 return this.element().childNodes[1].childNodes[0].childNodes[0].childNodes[1].childNodes[0];
      },

      updateNavBar: function()
      {
	 var buf = [];

	 for ( var i = 0 ; i < this.stack.length ; i++ )
	 {
	    var view = this.stack[i];

	    if ( buf.length != 0 ) buf.push(' > ');
	    buf.push(view.stackLabel);
	 }

	 this.navBarElement().innerHTML = buf.join('');
      },

      pushView: function (view, opt_label)
      {
	 this.setPreview(null);
	 view.stackLabel = opt_label || view.stackLabel || view.label;
	 this.stack.push(view);
	 this.viewAreaElement().innerHTML = view.toHTML();
	 this.updateNavBar();
	 view.stackView = this;
	 view.initHTML();
      },

      setPreview: function (view)
      {
	 if ( ! view ) { this.previewAreaElement().innerHTML = ""; return; }
	 this.previewAreaElement().innerHTML = view.toHTML();
	 view.initHTML();
      }

   }
});



