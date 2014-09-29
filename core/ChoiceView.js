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
MODEL({
  name: 'AbstractChoiceView',

  extendsModel: 'View',

  properties: [
    // This is the real, final choice. The internals use index only.
    // When useSelection is enabled, data is not set until a final choice is made.
    {
      model_: 'BooleanProperty',
      name: 'autoSetData',
      help: 'If true, this.data is set when choices update and the current data is not one of the choices.',
      defaultValue: true
    },
    {
      name: 'data',
      help: 'The value of the current choice (ie. [value, label] -> value).',
      postSet: function(_, d) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][0] === d ) {
            if ( this.index !== i ) {
              this.label = this.choices[i][1];
              this.index = i;
            }
            return;
          }
        }

        if ( d && this.choices.length )
          console.warn('ChoiceView data set to invalid choice: ', d);
      }
    },
    {
      name: 'label',
      help: 'The label of the current choice (ie. [value, label] -> label).',
      postSet: function(_, d) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][1] === d ) {
            if ( this.index !== i ) this.index = i;
            return;
          }
        }
      }
    },
    // See above; choice works the same as data.
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
        this.label = choice[1];
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
        var value = this.data;

        // Update current choice when choices update.
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var choice = newValue[i];

          if ( value === choice[0] ) {
            if ( this.useSelection ) this.index = i;
            else this.choice = choice;
            break;
          }
        }

        if ( this.autoSetData && i === newValue.length ) {
          if ( this.useSelection ) this.index = 0;
          else this.data = newValue.length ? newValue[0][0] : undefined;
        }

        this.updateHTML();
      }
    },
    // The authoritative selection internally. data and choice are outputs when
    // useSelection is enabled.
    {
      name: 'index',
      help: 'The index of the current choice.',
      preSet: function(_, i) {
        if ( i < 0 || this.choices.length == 0 ) return 0;
        if ( i >= this.choices.length ) return this.choices.length - 1;
        return i;
      },
      postSet: function(_, i) {
        // If useSelection is enabled, don't update data or choice.
        if ( this.useSelection ) return;
        if ( this.data !== this.choices[i][0] ) this.data = this.choices[i][0];
      }
    },
    {
      model_: 'FunctionProperty',
      name: 'objToChoice',
      help: 'A Function which adapts an object from the DAO to a [key, value, ...] choice.'
    },
    {
      name: 'useSelection',
      help: 'When set, data and choice do not update until an entry is firmly selected',
      model_: 'BooleanProperty'
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        this.dao.select(MAP(this.objToChoice))(function(map) {
          // console.log('***** Update Choices ', map.arg2, this.choices);
          this.choices = map.arg2;
        }.bind(this));
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.dao = this.dao;
    },

    findChoiceIC: function(name) {
      name = name.toLowerCase();
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        if ( this.choices[i][1].toLowerCase() == name )
          return this.choices[i];
      }
    },

    commit: function() {
      if ( ! this.useSelection ) return;
      if ( this.choices[this.index] )
        this.choice = this.choices[this.index];
    }
  }
});


MODEL({
  name: 'ChoiceListView',

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
    },
    {
      name: 'innerTagName',
      defaultValue: 'li'
    }
  ],

  listeners: [
    {
      name: 'updateSelected',
      code: function() {
        if ( ! this.$ || ! this.$.children ) return;
        for ( var i = 0 ; i < this.$.children.length ; i++ ) {
          var c = this.$.children[i];
          DOM.setClass(c, 'selected', i === this.index);
        }
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // Doing this at the low level rather than with this.setClass listeners
      // to avoid creating loads of listeners when autocompleting or otherwise
      // rapidly changing this.choices.
      this.index$.addListener(this.updateSelected);
      this.choices$.addListener(this.updateSelected);
    },
    choiceToHTML: function(id, choice) {
      return '<' + this.innerTagName + ' id="' + id + '" class="choice">' +
          choice[1] + '</' + this.innerTagName + '>';
    },
    toInnerHTML: function() {
      var out = [];
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        this.on(
          'click',
          function(index) {
            this.choice = this.choices[index];
          }.bind(this, i),
          id);

        out.push(this.choiceToHTML(id, choice));
      }
      return out.join('');
    },

    initHTML: function() {
      this.SUPER();
      this.updateSelected();
    },

    scrollToSelection: function() {
      // Three cases: in view, need to scroll up, need to scroll down.
      // First we determine the parent's scrolling bounds.
      var e = this.$.children[this.index];
      if ( ! e ) return;
      var parent = e.parentElement;
      while ( parent ) {
        var overflow = this.X.window.getComputedStyle(parent).overflow;
        if ( overflow === 'scroll' || overflow === 'auto' ) {
          break;
        }
        parent = parent.parentElement;
      }
      parent = parent || this.X.window;

      if ( e.offsetTop < parent.scrollTop ) { // Scroll up
        e.scrollIntoView(true);
      } else if ( e.offsetTop + e.offsetHeight >=
          parent.scrollTop + parent.offsetHeight ) { // Down
        e.scrollIntoView();
      }
    }
  }
});


MODEL({
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
      if ( ! this.$ ) return;
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
      this.SUPER();

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
        if ( this.timer_ ) this.X.clearTimeout(this.timer_);
        this.prev = ( this.prev === undefined ) ? this.data : this.prev;
        this.index = e.target.value;
      }
    },
    {
      name: 'onMouseOut',
      code: function(e) {
        if ( this.timer_ ) this.X.clearTimeout(this.timer_);
        this.timer_ = this.X.setTimeout(function() {
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


MODEL({
  name: 'RadioBoxView',

  extendsModel: 'ChoiceView',

  methods: {
    toHTML: function() {
      return '<span id="' + this.id + '"/></span>';
    },

    updateHTML: function() {
      if ( ! this.$ ) return;
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
      this.SUPER();

      Events.dynamic(function() { this.choices; }.bind(this), this.updateHTML.bind(this));
    }
  }
});


MODEL({
  name: 'PopupChoiceView',

  extendsModel: 'AbstractChoiceView',

  properties: [
    {
      name: 'linkLabel'
    },
    {
      name: 'iconUrl'
    },
    {
      name: 'tagName',
      defaultValue: 'span'
    },
    {
      name: 'className',
      defaultValue: 'popupChoiceView'
    },
    {
      model_: 'BooleanProperty',
      name: 'showValue'
    },
    {
      model_: 'FunctionProperty',
      name: 'updateListener'
    }
  ],

  actions: [
    {
      name: 'open',
      labelFn: function() { return this.linkLabel; },
      action: function() {
        var self = this;
        var view = this.X.ChoiceListView.create({
          className: 'popupChoiceList',
          data: this.data,
          choices: this.choices,
          autoSetData: this.autoSetData
        });

        var pos = findPageXY(this.$.querySelector('.action'));
        var e = this.X.document.body.insertAdjacentHTML('beforeend', view.toHTML());
        var s = this.X.window.getComputedStyle(view.$);

        function mouseMove(evt) {
          if ( ! view.$.contains(evt.target) ) remove();
        }

        function remove() {
          self.X.document.removeEventListener('touchstart', remove);
          self.X.document.removeEventListener('mousemove',  mouseMove);
          if ( view.$ ) view.$.remove();
        }

        // I don't know why the 'animate' is required, but it sometimes
        // doesn't remove the view without it.
        view.data$.addListener(EventService.animate(function() {
          self.data = view.data;
          remove();
        }, this.X));

        view.$.style.top = (pos[1]-2) + 'px';
        view.$.style.left = (pos[0]-toNum(s.width)+30) + 'px';
        view.$.style.maxHeight = (Math.max(200, this.X.window.innerHeight-pos[1]-10)) + 'px';
        view.initHTML();

        this.X.document.addEventListener('touchstart',  remove);
        view.$.addEventListener('click',                remove);
        this.X.document.addEventListener('mousemove',   mouseMove);
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      var out = '';

      if ( this.showValue ) {
        var id = this.nextID();
        out += '<span id="' + id + '" class="value">' + ((this.choice && this.choice[1]) || '') + '</span>';

        // Remove any previous data$ listener for this popup.
        if ( this.updateListener ) this.data$.removeListener(this.updateListener);
        this.updateListener = function() {
          var e = this.X.$(id);
          if ( e ) e.innerHTML = this.choice[1];
        }.bind(this);
        this.data$.addListener(this.updateListener);
      }

      out += '<span class="action">';
      this.model_.OPEN.iconUrl = this.iconUrl;
      var button = this.createActionView(this.model_.OPEN, {data: this}).toView_();

      this.addChild(button);

      out += button.toHTML();
      out += '</span>';

      return out;
    }
  }
});
