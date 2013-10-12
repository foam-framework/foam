/**
 * @license
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
var StackView = FOAM({
   model_: 'Model',

   name:  'StackView',
   extendsModel: 'AbstractView2',

   properties: [
      {
	 name:  'stack',
	 valueFactory: function() { return []; }
      },
      {
	 name:  'redo',
	 valueFactory: function() { return []; }
      },
      {
        name:   'backButton',
        type:  'ActionButton',
        valueFactory: function() {
          // TODO: What's the right value for the action button.
          return ActionButton.create(StackView.actions[0], new SimpleValue(this));
        }
      },
      {
        name:   'forwardButton',
        type:   'ActionButton',
        valueFactory: function() {
          return ActionButton.create(StackView.actions[1], new SimpleValue(this));
        }
      }
   ],

   actions: [
      {
         model_: 'Action',
	 name:  'back',
	 label: '<',
	 help:  'Go to previous view',

	 isEnabled:   function() { return this.stack.length > 1; },
	 action:      function() {
           if ( this.stack.length < 2 ) return;

	   this.redo.push(this.stack.pop());
	   this.pushView(this.stack.pop(), undefined, true);
	 }
      },
      {
         model_: 'Action',
	 name:  'forth',
	 label: '>',
	 help:  'Undo the previous back.',

	 action:      function() {
           this.pushView(this.redo.pop());
         }
      }
   ],

   methods: {
      init: function() {
        AbstractView2.getPrototype().init.call(this);
        this.addChild(this.forwardButton);
        this.addChild(this.backButton);
      },

      toHTML: function() {
	 return '<div class="stackview" style="width:100%;font-size:200%;font-family:sans-serif" id="' + this.getID() + '">' +
	    '<div class="stackview_navbar"></div>' +
            '<div class="stackview_navactions">' + this.backButton.toHTML() + this.forwardButton.toHTML() + '</div>' +
            '<table width=100% style="table-layout:fixed;"><tr><td width=100% notwidth2=53% valign=top><div class="stackview-viewarea"></div></td><td notwidth2=43% valign=top><div class="stackview_previewarea"></div></td></tr></table></div>';
      },

      setTopView: function(view, opt_label) {
	 this.stack = [];
	 this.pushView(view);
      },

      navBarElement: function() {
	 return this.$.childNodes[0];
      },

      navActionsElement: function() {
         return this.$.childNodes[1];
      },

      viewAreaElement: function () {
	 return this.$.childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
      },

      previewAreaElement: function() {
	 return this.$.childNodes[2].childNodes[0].childNodes[0].childNodes[1].childNodes[0];
      },

      updateNavBar: function() {
	 var buf = [];

	 for ( var i = 0 ; i < this.stack.length ; i++ )
	 {
	    var view = this.stack[i];

	    if ( buf.length != 0 ) buf.push(' > ');
	    buf.push(view.stackLabel);
	 }

	 this.navBarElement().innerHTML = buf.join('');
      },

      pushView: function (view, opt_label, opt_back) {
         if ( !opt_back ) this.redo.length = 0;
	 this.setPreview(null);
	 view.stackLabel = opt_label || view.stackLabel || view.label;
	 this.stack.push(view);
	 this.viewAreaElement().innerHTML = view.toHTML();
	 this.updateNavBar();
	 view.stackView = this;
	 view.initHTML();
      },

      setPreview: function(view) {
	 if ( ! view ) {
           this.viewAreaElement().parentNode.width = '100%';
           this.previewAreaElement().innerHTML = '';
	   return;
	 }

         this.viewAreaElement().parentNode.width = '65%';
	 this.previewAreaElement().innerHTML = view.toHTML();
	 view.initHTML();
      }

   }
});
