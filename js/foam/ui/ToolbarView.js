/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

// TODO: ActionBorder should use this.
CLASS({
  package: 'foam.ui',
  name:  'ToolbarView',
  label: 'Toolbar',

  requires: [
    'foam.ui.ActionButton',
    'foam.ui.MenuSeparator'
  ],

  imports: [
    'document'
  ],

  extends: 'foam.ui.View',

  properties: [
    {
      type: 'Boolean',
      name: 'horizontal',
      defaultValue: true
    },
    {
      type: 'Boolean',
      name: 'icons',
      defaultValueFn: function() {
        return this.horizontal;
      }
    },
    {
      name: 'data'
    },
    {
      name: 'left'
    },
    {
      name: 'top'
    },
    {
      name: 'bottom'
    },
    {
      name: 'right'
    },
    {
      type: 'Boolean',
      name: 'openedAsMenu',
      defaultValue: false
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'className',
      defaultValueFn: function() { return this.openedAsMenu ? 'ActionMenu' : 'ActionToolbar'; }
    }
  ],

  methods: {
    preButton: function(button) { return ' '; },
    postButton: function() { return this.horizontal ? ' ' : '<br>'; },

    openAsMenu: function() {
      var div = this.document.createElement('div');
      this.openedAsMenu = true;

      div.id = this.nextID();
      div.className = 'ActionMenuPopup';
      this.top ? div.style.top = this.top : div.style.bottom = this.bottom;
      this.left ? div.style.left = this.left : div.style.right = this.right;
      div.innerHTML = this.toHTML(true);

      var self = this;
      // Close window when clicked
      div.onclick = function() { self.close(); };

      div.onmouseout = function(e) {
        if ( e.toElement.parentNode != div && e.toElement.parentNode.parentNode != div ) {
          self.close();
        }
      };

      this.document.body.appendChild(div);
      this.initHTML();
    },

    close: function() {
      if ( ! this.openedAsMenu ) return this.SUPER();

      this.openedAsMenu = false;
      this.$.parentNode.remove();
      this.destroy();
      this.publish('closed');
    },

    toInnerHTML: function() {
      var str = '';
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        str += this.preButton(this.children[i]) +
          this.children[i].toHTML() +
          (this.MenuSeparator.isInstance(this.children[i]) ?
           '' : this.postButton(this.children[i]));
      }
      return str;
    },

    initHTML: function() {
      this.SUPER();

      // When the focus is in the toolbar, left/right arrows should move the
      // focus in the direction.
      this.addShortcut('Right', function(e) {
        var i = 0;
        for ( ; i < this.children.length && e.target != this.children[i].$ ; i++ );
        i = (i + 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.id);

      this.addShortcut('Left', function(e) {
        var i = 0;
        for ( ; i < this.children.length && e.target != this.children[i].$ ; i++ );
        i = (i + this.children.length - 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.id);
    },

    addAction: function(a) {
      var view = this.ActionButton.create({ action: a });
      if ( a.children.length > 0 ) {
        var self = this;
        view.action = a.clone();
        view.action.action = function() {
          var toolbar = FOAM.lookup('foam.ui.ToolbarView', this.X).create({
            data$:    self.data$,
            document: self.document,
            left:     view.$.offsetLeft,
            top:      view.$.offsetTop
          }, this.Y);
          toolbar.addActions(a.children);
          toolbar.openAsMenu(view);
        };
      }
      this.addDataChild(view);
    },
    addActions: function(actions) {
      actions.forEach(this.addAction.bind(this));
    },
    addSeparator: function() {
      this.addChild(this.MenuSeparator.create());
    }
  }
});
