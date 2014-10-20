/*
 * Copyright 2013 Google Inc. All Rights Reserved.
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
   name:  'LabelView',

   extendsModel: 'View',

   properties: [
      {
         // Must be a synchronous DAO
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
         defaultValueFn: function() {
           return GLOBAL.EMailLabelDAO;
         },
         hidden: true
      },
      {
         name:  'value',
         type:  'Value',
         postSet: function(oldValue, newValue) {
            oldValue && oldValue.removeListener(this.updateHTML);
            newValue.addListener(this.updateHTML);
            this.updateHTML();
         },
         factory: function() { return SimpleValue.create(); }
      }
   ],

   listeners:
   [
      {
         model_: 'Method',

         name: 'updateHTML',
         code: function() {
            var e = this.$;
            if ( e ) e.innerHTML = this.labelsToHTML();
         }
      }
   ],

  constants: {
      DEFAULT_LABEL_COLORS: [
        { b: "#f1f5ec", f: "#006633"},
        { b: "#dee5f2", f: "#5a6986"},
        { b: "#e0ecff", f: "#206cff"},
        { b: "#dfe2ff", f: "#0000cc"},
        { b: "#e0d5f9", f: "#5229a3"},
        { b: "#fde9f4", f: "#854f61"},
        { b: "#ffe3e3", f: "#cc0000"},
        { b: "#fff0e1", f: "#ec7000"},
        { b: "#fadcb3", f: "#b36d00"},
        { b: "#f3e7b3", f: "#ab8b00"},
        { b: "#ffffd4", f: "#636330"},
        { b: "#f9ffef", f: "#64992c"},
        { b: "#f1f5ec", f: "#006633"},
        { b: "#5a6986", f: "#dee5f2"},
        { b: "#206cff", f: "#e0ecff"},
        { b: "#0000cc", f: "#dfe2ff"},
        { b: "#5229a3", f: "#e0d5f9"},
        { b: "#854f61", f: "#fde9f4"},
        { b: "#cc0000", f: "#ffe3e3"},
        { b: "#ec7000", f: "#fff0e1"},
        { b: "#b36d00", f: "#fadcb3"},
        { b: "#ab8b00", f: "#f3e7b3"},
        { b: "#636330", f: "#ffffd4"},
        { b: "#64992c", f: "#f9ffef"},
        { b: "#006633", f: "#f1f5ec"}
     ]
  },

   methods: {
      // TODO: deprecate
      getValue: function() {
         return this.value;
      },

      // TODO: deprecate
      setValue: function(value) {
         this.value = value;
      },
/*
      initHTML: function() {
         View.getPrototype().initHTML.call(this);
         // if ( this.value ) this.value.addListener(this.updateHTML.bind(this));
      },
*/
      toHTML: function() {
         return '<div class="labelList" id="' + this.id + '"></div>';
      },

      updateHTML: function() {
      },

      labelsToHTML: function() {
         // TODO:  Make this a provided dao
         // TODO:  Extract property name to constant
         // TODO:  Update the string asynchornously so this doesn't depend on MDAO
         var customLabelColorMapStr = '';
         EMailPreferences.find(EQ(EMailPreference.NAME, 'sx_clcp'), {
           put: function(prop) {
             customLabelColorMapStr = prop.value;
           },
           err: function() { console.log('error'); }
         });

         var ps = StringPS.create(customLabelColorMapStr);

         var customLabelColorMap = CustomLabelColorMapParser.parse(
             CustomLabelColorMapParser.colormap, ps).value;

         var out = "";
         var a = this.value.get();

         for ( var i = 0 ; i < a.length ; i++ ) {
            var asHTML = this.labelToHTML(a[i], customLabelColorMap);
            if (asHTML) {
              out += "&nbsp;" + asHTML;
            }
         }

         return out;
      },

      labelToHTML: function(l, customColorMap) {
         var label;

         if ( this.dao ) {
           this.dao.find(EQ(EMailLabel.ID, l), {
             put: function(el) {
                label = el;
             },
             err: function() { console.log('error'); }
           });
         }

         if ( ! label || ! label.isRenderable() ) {
           return undefined;
         }

         var colorPair = this.lookupColorPair(label, customColorMap);
         var style = '';
         if (colorPair) {
           var background = colorPair.b;
           var foreground = colorPair.f;
           style = ' style="';
           style += 'background-color: ' + background + '; ';
           style += 'border-color: ' + foreground + '; ';
           style += 'color: ' + foreground + '"';
         }

         var displayName = label.getRenderName();
         return '<span' + style + ' class="label">' + displayName + '</span>';
      },

      lookupColorPair: function(label, customColorMap) {
        var colorIdx = label.color;
        if (label.isSystemLabel() && !colorIdx) {
          return this.getSystemLabelColor(label);
        } else if (!colorIdx) {
          return undefined;
        } else if (colorIdx >= 0) {
          return this.DEFAULT_LABEL_COLORS[colorIdx];
        } else {
          return customColorMap[colorIdx];
        }
      },

      getSystemLabelColor: function(label) {
        var labelId = label.displayName;
        switch(labelId) {
         case label.SystemLabels.STARRED:
         case label.SystemLabels.IMPORTANT:
          return { b: '#ffd76e', f: '#80572a' };
         case label.SystemLabels.DRAFT:
          return { b: '#ffffff', f: '#ff0000' };
         default:
          return { b: '#dddddd', f: '#666666' };
         }
      }
   }
});


var CustomLabelColorMapGrammar = {
  __proto__: grammar,

  START: sym('colormap'),

  dig: range('0', '9'),

  uint: plus(sym('dig')),

  num: seq(optional('-'), sym('uint')),

  hex: alt(range('0', '9'), range('a', 'f'), range('A', 'F')),

  hex3byte: repeat(sym('hex'), undefined, 6, 6),

  colormap: repeat(sym('colorentry'), ','),

  colorentry: seq(sym('colorindex'), ':', sym('color'), ':', sym('color')),

  colorindex: sym('num'),

  color: seq('#', sym('hex3byte'))
};

var CustomLabelColorMapParser = {
  __proto__: CustomLabelColorMapGrammar,
}.addActions({
  'uint': function(v) {
    return v.join('');
  },
  'num': function(v) {
    return Number(v.join(''));
  },
  'hex3byte': function(v) {
    return v.join('');
  },
  'color': function(v) {
    return v.join('');
  },
  'colorentry': function(v) {
    return [v[0], { b: v[2], f: v[4] }];
  },
  'colormap': function(v) {
    var result = [];
    var entry;
    for (var i = v.length; entry = v[--i];) {
      result[entry[0]] = entry[1];
    }
    return result;
  }
});
