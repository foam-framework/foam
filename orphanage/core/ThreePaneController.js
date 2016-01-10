/**
 * @license
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

function pos(e, top, left, width, height) {
   var s = e.style;
   left = left || 0;

   top != null && (e.style.top = toNum(top) + 'px');
   left != null && (e.style.left = toNum(left) + 'px');
   width != null && (e.style.width = toNum(width) + 'px');
   height != null && (e.style.height = toNum(height) + 'px');
}

CLASS({
  name: 'ThreePaneController',
  label: 'ThreePaneController',

  extendsModel: 'foam.ui.View',

  properties: [
    {
      name: 'model',
      type: 'Model',
      required: true
    },
    {
      name: 'daoListener',
      hidden: true,
      factory: function() {
        return {
          put: this.onDaoUpdate,
          remove: this.onDaoUpdate
        };
      },
      postSet: function(oldValue, newValue) {
        if (this.dao) {
          this.dao.unlisten(oldValue);
          this.dao.listen(newValue);
        }
      }
    },
    {
      name: 'dao',
      type: 'DAO',
      required: true,
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.unlisten(this.daoListener);
        newValue.listen(this.daoListener);
      }
    },
    {
      name: 'queryParser',
      factory: function() {
        return QueryParserFactory(this.model);
      }
    },
    {
      name: 'searchField',
      type: 'foam.ui.TextFieldView',
      factory: function() {
        return TextFieldView.create({
          name: 'search',
          type: 'search',
          onKeyMode: true,
          displayWidth: 95
        });
      },
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.value.addListener(this.performQuery);
        newValue.value.addListener(this.performQuery);
      }
    },
    {
      name: 'countField',
      type: 'foam.ui.TextFieldView',
      factory: function() {
        return TextFieldView.create({
          name: 'count',
          mode: 'read-only',
          displayWidth: 40
        });
      }
    },
    {
      name: 'searchChoice',
      type: 'ListChoiceView',
      required: true,
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.value.removeListener(this.performQuery);
        newValue.value.addListener(this.performQuery);
      }
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 500
    },
    {
      type: 'Int',
      name: 'height',
      defaultValue: 500
    },
    {
      type: 'Int',
      name: 'headerHeight',
      defaultValue: 119
    },
    {
      type: 'Int',
      name: 'footerHeight',
      defaultValue: 30
    },
    {
      type: 'Int',
      name: 'maxSearchWidth',
      defaultValue: 160
    },
    {
      type: 'Int',
      name: 'searchWidth',
      defaultValue: 160
    },
    {
      type: 'Int',
      name: 'minThreeColumnWidth',
      defaultValue: 1250
    },
    {
      name: 'threeColumnLeftPaneWeight',
      defaultValue: 0.45
    },
    {
      name: 'table',
      type: 'foam.ui.View',
      factory: function() {
        return TableView.create({
            model: this.model,
            dao: this.dao,
            scrollEnabled: true,
            rows: 20
          });
      },
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.scrollbar.removeListener(this.updateCount);
        newValue.scrollbar.addListener(this.updateCount);
        this.addChild(newValue);
        this.removeChild(oldValue);
      }
    },
    {
      name: 'toolbar',
      type: 'foam.ui.View',
      factory: function() {
        return ToolbarView.create({
          actions: this.model.actions,
          value: this.table.selection
        });
      },
      postSet: function(oldValue, newValue) {
        this.addChild(newValue);
        this.removeChild(oldValue);
      }
    },
    {
      name: 'editView',
      type: 'foam.ui.View',
      factory: function() {
        return DetailView.create({model: this.model}/*, this.table.selection*/);
      },
      postSet: function(oldValue, newValue) {
        this.addChild(newValue);
        this.removeChild(oldValue);
        oldValue && oldValue.value && oldValue.value.removeListener(this.onValueChange);
        newValue.value.addListener(this.onValueChange);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      Events.dynamicFn(function() {
        self.headerHeight;
        self.footerHeight;
        self.searchWidth;
        self.minThreeColumnWidth;
        self.threeColumnLeftPaneWeight;
      }, self.layout);
    },
    setLogo: function(src) {
      $('logo-' + this.id).src = src;
    },
    toHTML: function() {
      return '<div style="width: 100%; height: 100%;" id="' + this.id + '">\n' +
        '<table class="header" id="header-' + this.id + '">\n' +
        '  <tr>\n' +
        '  <td style="height: 49px; padding: 5px 0px">\n' +
        '    <img id="logo-' + this.id + '" height="49" style="margin-left: 10px" src="images/logo.png">\n' +
        '  </td>\n' +
        '  <td width="5%"></td>\n' +
        '  <td width="45"><img src="images/search-icon.png" style="vertical-align:middle;"></td>\n' +
        '  <td width=65% valign2="bottom">\n' +
        '  <div class="titleBar">\n' +
        this.searchField.toHTML() +
        '  </div>\n' +
        '  </td>\n' +
        '  <td width="5%"></td>\n' +
        '  <td width="20%" align=center valign2="bottom">\n' +
        this.countField.toHTML() +
        '  </td>\n' +
        '  <td width="10%"></td>\n' +
        '  <td align="right">\n' +
        '    <div><img id="settings-' + this.id + '" src="images/settings.svg"> &nbsp;</div>\n' +
        '  </td>\n' +
        '  </tr>\n' +
        '</table>\n' +
        '<span class="toolbar" id="toolbar-' + this.id + '">' + this.toolbar.toHTML() + '</span>\n' +
        '<div id="search-' + this.id + '" style="position:absolute;background-color:#fff;overflow-y:auto;overflow-x:hidden">\n' +
        '  <span class="searchChoice">' + this.searchChoice.toHTML() + '</span>\n' +
        '</div>\n' +
        '<div class="browse" id="browse-' + this.id + '" style="position:absolute;background-color:#FFF;float:left;">' + this.table.toHTML() + '</div>\n' +
        '<div class="edit" id="edit-' + this.id + '" style="position:absolute;position:absolute;background-color:#FFF;overflow:scroll;">\n' +
        this.editView.toHTML() +
        '</div>\n' +
        '<div id="footer-' + this.id + '" style="position:absolute;text-align:right;padding-top:3px;width:100%"> \n' +
        '  <a href="https://code.google.com/p/foam-framework/" style="text-decoration: none" target="_blank">\n' +
        '  <font size=-1 face="catull" style="padding-left:10px;text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\n' +
        '  <font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#ddaa00">A</font><font color="#33CC00">M</font>\n\n' +
        '  <font color2="#555555"> POWERED</font></a>\n' +
        '</div>\n' +
        '</div>';
    },
    initHTML: function() {
       var self = this;
       var lastSelection = undefined;

       this.searchField.initHTML();
       this.searchChoice.initHTML();
       this.table.initHTML();
       this.editView.initHTML();
       this.countField.initHTML();
       this.toolbar.initHTML();

       this.searchField.$.style.display = 'table-cell';
       this.searchField.$.style.width = '100%';

       this.table.selection.addListener(EventService.merged(function (value) {
         var newValue = value.get();
         var oldValue = self.editView.value.get();

         // No need to reload from database if we're updating to same row
        // if ( ! newValue || oldValue && newValue === oldValue ) return;
         if ( newValue === lastSelection ) return;

         self.editView.value.set(newValue);
       }, 200));

       if ( this.model.OPEN && Action.isInstance( this.model.OPEN ) ) {
         this.table.hardSelection.addListener(function(value) {
           value.get().open();
         });
       }
    }
  },

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        this.editView.initHTML();
      }
    },
    {
      name: 'performQuery',
      code: function() {
        var predicate = AND(
          this.queryParser.parseString(this.searchChoice.value.get()) || TRUE,
          this.queryParser.parseString(this.searchField.value.get()) || TRUE)
          .partialEval();

        console.log('query: ', predicate.toMQL());

        this.table.scrollbar.value = 0;

        this.table.model = this.model;
        this.table.dao = this.dao.where(predicate);
      }
    },
    {
      name: 'layout',
      isMerged: true,
      code: function() {
        if ( !this.$ ) return;

        var hideTable = this.table.scrollbar.size == 1;
        var W         = this.$.offsetWidth; //window.innerWidth;
        var H         = this.$.offsetHeight; //window.innerHeight;
        var SEARCH_H  = H - this.headerHeight - this.footerHeight;
        var RIGHT_W   = W - this.searchWidth-1;

        //  pos(header,null,null,W,HEADER_H-10);
        pos($('search-' + this.id), this.headerHeight, null, this.maxSearchWidth, SEARCH_H);

        if ( W > this.minThreeColumnWidth ) {
          pos($('browse-' + this.id),
              this.headerHeight,
              this.searchWidth + 1,
              RIGHT_W * this.threeColumnLeftPaneWeight,
              SEARCH_H);

          pos($('edit-' + this.id),
              this.headerHeight,
              this.searchWidth + 1 + RIGHT_W * this.threeColumnLeftPaneWeight,
              RIGHT_W * 0.55-10,
              SEARCH_H-10);
        } else {
          pos($('browse-' + this.id),
              this.headerHeight,
              this.searchWidth + 1,
              RIGHT_W,
              SEARCH_H/2-4);

          pos($('edit-' + this.id),
              hideTable ? this.headerHeight : toNum($('browse-' + this.id).style.top) + toNum($('browse-' + this.id).style.height),
              this.searchWidth + 1,
              RIGHT_W,
              hideTable ? SEARCH_H : SEARCH_H / 2);
        }
        pos($('footer-' + this.id),
            H-this.footerHeight+10,
            null,
            W,
            this.footerHeight);
      }
    },
    {
      name: 'onDaoUpdate',
      isMerged: 100,
      code: function() {
         var self = this;
         if ( this.table.selection.get() )
            this.dao.find(this.table.selection.get().id, {
               put: function(obj) {
                  self.table.selection.set(obj);
                  self.table.dao = self.table.dao;
               }
             });
         else
            this.table.dao = this.table.dao;
      }
    },
    {
      name: 'updateCount',
      isMerged: true,
      code: function() {
        var self = this;
        this.dao.select(COUNT())(function(c) {
          self.countField.value.set(
            self.table.scrollbar.size + ' of ' + c.count + ' selected');
        });
      }
    }
  ]
});
