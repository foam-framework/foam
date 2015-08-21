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
  name: 'FlexTableView',
  extendsModel: 'foam.ui.md.TableView',

  requires: [ 'foam.ui.FlexTableView' ],

  properties: [
    {
      name: 'table',
      lazyFactory: function() {
        return this.FlexTableView.create({
          scrollEnabled: true,
          className: 'mdTable',
          ascIcon: '<i class="material-icons">keyboard_arrow_up</i>',
          descIcon: '<i class="material-icons">keyboard_arrow_down</i>',
          model$: this.model$,
          data$: this.data$,
          properties$: this.properties$
        });
      }
    }
  ],


  templates: [ { name: 'CSS' } ]
});
