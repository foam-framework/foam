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
 

CLASS({
  name: 'PopupChoiceView',
  package: 'foam.ui',

  extendsModel: 'foam.ui.AbstractChoiceView',

  requires: ['foam.ui.ChoiceListView'],
  
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
    },
    {
      name: 'mode',
      defaultValue: 'read-write'
    }
  ],

  actions: [
    {
      name: 'open',
      labelFn: function() { return this.linkLabel; },
      action: function() {
        var self = this;
        var view = this.ChoiceListView.create({
          className: 'popupChoiceList',
          data: this.data,
          choices: this.choices,
          autoSetData: this.autoSetData
        });

        var pos = findViewportXY(this.$.querySelector('.action'));
        var e = this.X.document.body.insertAdjacentHTML('beforeend', view.toHTML());
        var s = this.X.window.getComputedStyle(view.$);

        function mouseMove(evt) {
          // Containment is not sufficient.
          // It makes the popup too eager to close since the mouse can start
          // slightly outside the box. We need to check the coordinates, and
          // only close it when it's not upwards and leftwards of the box edges,
          // ie. to pretend the popup reaches the top and right of the window.
          if ( view.$.contains(evt.target) ) return;

          var margin = 50;
          var left = view.$.offsetLeft - margin;
          var right = view.$.offsetWidth + left + 2*margin;
          var top = view.$.offsetTop - margin;
          var bottom = view.$.offsetHeight + top + 2*margin;

          if ( (left < evt.pageX && evt.pageX < right) &&
              (top < evt.pageY && evt.pageY < bottom) )
            return;

          remove();
        }

        function remove() {
          self.X.document.removeEventListener('touchstart', remove);
          self.X.document.removeEventListener('mousemove',  mouseMove);
          if ( view.$ ) view.$.remove();
        }

        // I don't know why the 'animate' is required, but it sometimes
        // doesn't remove the view without it.
        view.data$.addListener(EventService.framed(function() {
          self.data = view.data;
          remove();
        }, this.X));

        view.$.style.top = (pos[1]-2) + 'px';
        var left = Math.max(0, pos[0] - toNum(s.width) + 30);
        view.$.style.left = left + 'px';
        view.$.style.maxHeight = (Math.max(200, this.X.window.innerHeight-pos[1]-10)) + 'px';
        view.initHTML();

        this.X.document.addEventListener('touchstart',  remove);
        view.$.addEventListener('click',                remove);
        this.X.document.addEventListener('mousemove',   mouseMove);
      }
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.mode === 'read-only' ) {
        return '<span id="' + id + '" class="popupChoiceView-readonly">' +
            ((this.choice && this.choice[1]) || '') + '</span>';
      } else {
        return this.SUPER();
      }
    },
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
      var button = this.createActionView(this.model_.OPEN).toView_();

      this.addSelfDataChild(button);

      out += button.toHTML();
      out += '</span>';

      return out;
    }
  }
});
