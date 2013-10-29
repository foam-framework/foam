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
/*
 * TODO:
 *    handle multiple-selection
 *    map <enter> key to <br>
 *    support removing/toggling an attribute
 *    check that the selected text is actually part of the element
 *    add the rest of the common styling options
 *    improve L&F
 *    add an optional HTML-sanitizer for hosted apps
 */

var RichTextView = FOAM({

   model_: 'Model',

   extendsModel: 'AbstractView',

   name: 'RichTextView',

    properties: [
      {
         name:  'height',
         type:  'int',
         view:  'IntFieldView',
         defaultValue: 400
      },
      {
         name:  'width',
         type:  'int',
         view:  'IntFieldView',
         defaultValue: 800
      },
      {
         name:  'mode',
         type:  'String',
         defaultValue: 'read-write',
         view: {
              create: function() { return ChoiceView.create({choices:[
                 "read-only", "read-write", "final"
              ]}); } }
      },
      {
         name:  'value',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); },
         postSet: function(newValue, oldValue) {
           Events.unlink(this.domValue, oldValue);

           //Events.follow(this.model, this.domValue);
           try {
             Events.link(newValue, this.domValue);
             // Events.relate(newValue, this.domValue, this.valueToText.bind(this), this.textToValue.bind(this));
           } catch (x) {
           }
         }
      }
    ],

   methods: {
      init: function(args) {
         AbstractView.init.call(this, args);
         this.toolbar = ActionToolbarView.create({actions:FOAM([
            {
               model_: 'Action',
               name: 'bold',
               label: '<b>B</b>',
               help: 'Bold text.',
               action: function () {
                  console.log('bold');
                  var s = window.getSelection();
                  if ( s.rangeCount != 1 ) return;
                  var r = s.getRangeAt(0);
                  console.log('range:',r);

                  var selectionContents = r.extractContents();
                  var b = document.createElement("b");
                  b.appendChild(selectionContents);
                  r.insertNode(b);
               }
            },
            {
               model_: 'Action',
               name: 'italic',
               label: '<i>i</i>',
               help: 'Italic text.',
               action: function () {
                  console.log('italic');
                  var s = window.getSelection();
                  if ( s.rangeCount != 1 ) return;
                  var r = s.getRangeAt(0);
                  console.log('range:',r);

                  var selectionContents = r.extractContents();
                  var b = document.createElement("i");
                  b.appendChild(selectionContents);
                  r.insertNode(b);
               }
            }

         ])});
      },

      toHTML: function() {
         var m = this.mode === 'read-write' ? ' contenteditable' : '';
         return '<div' + m + ' id="' + this.getID() + '" style="border:solid 2px #b7ddf2;width:' + this.width + ';height:' + this.height + '"/> </div>' + this.toolbar.toHTML();
      },

      setValue: function(value) {
         this.value = value;
      },

      initHTML: function() {
         this.toolbar.initHTML();
         this.domValue = DomValue.create(this.$, 'input', 'innerHTML');
          this.value = this.value;
      },

      destroy: function() {
         Events.unlink(this.domValue, this.value);
      },

      textToValue: function(text) { return text; },

      valueToText: function(value) { return value; }
  }

});
