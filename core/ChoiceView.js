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
FOAModel({
  name: 'AbstractChoiceView',

  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      postSet: function(oldDAO, dao) {
        if ( oldDAO ) oldDAO.unlisten(this.onDAOUpdate);
        dao.listen(this.onDAOUpdate);
        this.onDAOUpdate();
      }
    },
    {
      name: 'valueProperty',
      defaultValue: { f: function(o) { return o.id; } }
    },
    {
      name: 'labelProperty'
    },
    {
      name: 'data',
      help: 'The value of the current choice (ie. [value, label] -> value).',
      postSet: function(_, d) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][0] === d ) {
            if ( this.index !== i ) this.index = i;
            return;
          }
        }
      }
    },
    {
      name: 'choice',
      help: 'The current choice (ie. [value, label]).',
      getter: function() {
        var value = this.data;
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          var choice = this.choices[i];
          if ( value === choice[0] ) return choice;
        }
        return undefined;
      },
      setter: function(choice) {
        var oldValue = this.choice;
        this.data = choice[0];
        this.propertyChange('choice', oldValue, this.choice);
      }
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      help: 'Array of [value, label] choices.  Simple String values will be upgraded to [value, value].',
      defaultValue: [],
      preSet: function(_, a) {
        a = a.clone();
        // Upgrade single values to [value, value]
        for ( var i = 0 ; i < a.length ; i++ )
          if ( ! Array.isArray(a[i]) )
            a[i] = [a[i], a[i]];
        return a;
      },
      postSet: function(_, newValue) {
        var value = this.data

        // Update current choice when choices update
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var choice = newValue[i];

          if ( value === choice[0] ) {
            this.choice = choice;
            break;
          }
        }

        if ( i === newValue.length ) this.data = newValue.length ? newValue[0][0] : undefined;

        if ( this.$ ) this.updateHTML();
      }
    },
    {
      name: 'index',
      help: 'The index of the current choice.',
      postSet: function(_, i) {
        if ( this.data !== this.choices[i][0] ) this.data = this.choices[i][0];
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
//      isMerged: 160,
      code: function() {
        var self = this;
        this.dao.select(MAP(
          {f: function(o) {
            return [ self.valueProperty.f(o), self.labelProperty.f(o)];
          }},
          []
        ))(function(map) {
          var choices = map.arg2;
          self.choices = choices;
        });
      }
    }
  ],

  methods: {
    findChoiceIC: function(name) {
      name = name.toLowerCase();
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        if ( this.choices[i][1].toLowerCase() == name )
          return this.choices[i];
      }
    }
  }
});


FOAModel({
  name:  'ChoiceListView',

  extendsModel: 'AbstractChoiceView',

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal',
      view: {
        model_: 'ChoiceView',
        choices: [
          [ 'horizontal', 'Horizontal' ],
          [ 'vertical',   'Vertical'   ]
        ]
      },
      postSet: function(old, nu) {
        if ( this.$ ) {
          DOM.setClass(this.$, old, false);
          DOM.setClass(this.$, nu);
        }
      }
    },
    {
      name: 'className',
      defaultValueFn: function() { return 'foamChoiceListView ' + this.orientation; }
    },
    {
      name: 'tagName',
      defaultValue: 'ul'
    }
  ],

  methods: {
    toInnerHTML: function() {
      var out = "";
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        this.on(
          'click',
          function(choice) {
            this.choice = choice;
          }.bind(this, choice),
          id);

        this.setClass(
          'selected',
          function(choice) { return this.choice == choice; }.bind(this, choice),
          id);

        out += '<li id="' + id + '" class="choice">' + choice[1] + '</li>';
      }
      return out;
    }
  }
});


FOAModel({
  name:  'ChoiceView',

  extendsModel: 'AbstractChoiceView',

  /*
   * <select size="">
   *    <choice value="" selected></choice>
   * </select>
   */
  properties: [
    {
      name:  'name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name:  'helpText',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'size',
      type:  'int',
      defaultValue: 1
    }
  ],

  methods: {
    toHTML: function() {
      return '<select id="' + this.id + '" name="' + this.name + '" size=' + this.size + '/></select>';
    },

    updateHTML: function() {
      var out = [];

      if ( this.helpText ) {
        out.push('<option disabled="disabled">');
        out.push(this.helpText);
        out.push('</option>');
      }

      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        try {
          this.on('click', this.onClick, id);
          this.on('mouseover', this.onMouseOver, id);
          this.on('mouseout', this.onMouseOut, id);
        } catch (x) {
          // Fails on iPad, which is okay, because this feature doesn't make
          // sense on the iPad anyway.
        }

        out.push('\t<option id="' + id + '"');

        if ( choice[0] === this.data ) out.push(' selected');
        out.push(' value="');
        out.push(i + '">');
        out.push(choice[1].toString());
        out.push('</option>');
      }

      this.$.innerHTML = out.join('');
      View.getPrototype().initHTML.call(this);
    },

    initHTML: function() {
      var e = this.$;

      this.updateHTML();
      this.domValue = DomValue.create(e);
      Events.link(this.index$, this.domValue);
    }
  },

  listeners: [
    {
      name: 'onMouseOver',
      code: function(e) {
        if ( this.timer_ ) window.clearTimeout(this.timer_);
        this.prev = ( this.prev === undefined ) ? this.data : this.prev;
        this.index = e.target.value;
      }
    },
    {
      name: 'onMouseOut',
      code: function(e) {
        if ( this.timer_ ) window.clearTimeout(this.timer_);
        this.timer_ = window.setTimeout(function() {
          this.data = this.prev || '';
          this.prev = undefined;
        }.bind(this), 1);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        this.data = this.prev = this.choices[e.target.value][0];
      }
    }
  ]
});


FOAModel({
  name:  'RadioBoxView',

  extendsModel: 'ChoiceView',

  methods: {
    toHTML: function() {
      return '<span id="' + this.id + '"/></span>';
    },

    updateHTML: function() {
      var out = '';
      var self = this;
      this.choices.forEach(function(choice) {
        var value  = choice[0];
        var label  = choice[1];
        var id     = self.nextID();

        out += label + ':<input type="radio" name="';
        out += self.id;
        out += '" value="';
        out += value;
        out += '" ';
        out += 'id="' + id + '"';
        if ( self.data === value ) out += ' checked';
        out += '> ';

        self.on('click', function() { self.data = value; }, id)
        self.data$.addListener(function() { $(id).checked = ( self.data == value ); });
      });

      this.$.innerHTML = out;
      View.getPrototype().initHTML.call(this);
    },

    initHTML: function() {
      Events.dynamic(function() { this.choices; }.bind(this), this.updateHTML.bind(this));
    }
  }
});


FOAModel({
  name:  'PopupChoiceView',

  extendsModel: 'AbstractChoiceView',

  properties: [
    {
      name: 'label'
    },
    {
      name: 'iconUrl'
    },
    {
      name: 'tagName',
      defaultValue: 'button'
    },
    {
      name: 'className',
      defaultValue: 'popupChoiceView'
    },
    {
      model_: 'BooleanProperty',
      name: 'showValue'
    }
  ],

  listeners: [
    {
      name: 'popup',
      code: function(e) {
        var view = ChoiceListView.create({
          className: 'popupChoiceList',
          data: this.data,
          choices: this.choices
        });

        // I don't know why the 'animate' is required, but it sometimes
        // doesn't remove the view without it.
        view.data$.addListener(EventService.animate(function() {
          this.data = view.data;
          if ( view.$ ) view.$.remove();
        }.bind(this)));

        var pos = findPageXY(this.$.querySelector('.action'));
        var e = this.X.document.body.insertAdjacentHTML('beforeend', view.toHTML());
        var s = this.X.window.getComputedStyle(view.$);
        var parentNode = view.$.parentNode;

        view.$.style.top = pos[1]-2;
        view.$.style.left = pos[0]-toNum(s.width)+30;
        view.$.style.maxHeight = Math.max(200, this.X.window.innerHeight-pos[1]-10);
        view.initHTML();
        view.$.addEventListener('click', function() { if ( view.$ ) view.$.remove(); });
        parentNode.addEventListener('mousemove', function(evt) {
          if ( ! view.$ ) {
            parentNode.removeEventListener('mousemove', arguments.callee);
          } else if ( ! view.$.contains(evt.target) ) {
            parentNode.removeEventListener('mousemove', arguments.callee);
            view.$.remove();
          }
        });
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      var out = '';

      if ( this.showValue ) {
        var id = this.nextID();
        out += '<span id="' + id + '" class="value">' + (this.choice[1] || '') + '</span>';
        this.data$.addListener(function() { this.X.$(id).innerHTML = this.choice[1]; }.bind(this));
      }

      out += '<span class="action">';
      if ( this.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.iconUrl) + '">';
      }

      if ( this.label ) {
        out += this.label;
      }
      out += '</span>';

      return out;
    },

    initHTML: function() {
      this.$.addEventListener('click', this.popup);
    }
  }
});
