/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.ui.md',
  name: 'TableView',
  extendsModel: 'foam.ui.TableView',

  properties: [
    {
      model_: 'StringProperty',
      name: 'className',
      lazyFactory: function() {
        return 'mdTable ' + this.model.name + 'Table';
      }
    },
    {
      name: 'ascIcon',
      defaultValue: '<i class="material-icons">keyboard_arrow_up</i>'
    },
    {
      name: 'descIcon',
      defaultValue: '<i class="material-icons">keyboard_arrow_down</i>'
    },
  ],

  templates: [
    function toHTML() {/*
      <div tabindex="99" class="mdTableView" style="display:flex;width:100%;">
        <span id="%%id" style="flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">
          <% this.tableToHTML(out); %>
        </span>
        <%= this.scrollbarEnabled ?
            ('<span style="width:19px;flex:none;overflow:hidden;">' +
            this.scrollbar.toView_().toHTML() + '</span>') : '' %>
      </div>
    */},
    { name: 'CSS' }
  ]
});
