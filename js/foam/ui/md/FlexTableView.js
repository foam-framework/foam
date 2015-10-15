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
  extends: 'foam.ui.md.TableView',

  requires: [
    'foam.ui.FlexTableView',
    'foam.ui.Icon',
  ],

  properties: [
    {
      name: 'table',
      lazyFactory: function() {
        return this.FlexTableView.create({
          scrollEnabled: true,
          className: 'mdTable',
          ascIcon: this.Icon.create({
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAOklEQVR4AWMYYaABCAkq+Q+EDYSUzGSYBVKGT8l0BkYgxKnMASgxDagACKDK7LEp84YogSgD8kYIAACj3BCo983dYwAAAABJRU5ErkJggg==',
            ligature: 'keyboard_arrow_up',
            width: 16,
            height: 16,
            fontSize: 16
          }, this.Y),
          descIcon: this.Icon.create({
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAQklEQVR4AWMYDoAFnYcJNBnuMFjDebYMtxk0MBVJMtxg+MxgA1XyBciTBLMxlQElbfAoQShDKMGjDKYErzIgHFEAAGLzEOwIrN0jAAAAAElFTkSuQmCC',
            ligature: 'keyboard_arrow_down',
            width: 16,
            height: 16,
            fontSize: 16
          }, this.Y),
          rowView: this.rowView,
          rowHeight: this.rowHeight,
          model$: this.model$,
          data$: this.data$,
          properties$: this.properties$
        });
      }
    },
    {
      name: 'rowView',
    },
    {
      name: 'rowHeight',
      documentation: 'Set me to control the (fixed!) row height for the table.',
      defaultValue: 48
    },
  ],


  templates: [ { name: 'CSS' } ]
});
