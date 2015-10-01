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
  package: 'foam.apps.builder.events',
  name: 'EventsDetailView',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.ImageView',
  ],

  properties: [
    ['className', 'events-detail-view'],
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class='md-card-shell'>
          $$image{ model_: 'foam.ui.ImageView' }
          $$name{ model_: 'foam.ui.md.TextFieldView', floatingLabel: false, mode: 'read-only', extraClassName: 'md-subhead' }
          $$date{ model_: 'foam.ui.md.TextFieldView', floatingLabel: false, mode: 'read-only' }
          <div class="description-box">
            $$description{ model_: 'foam.ui.md.TextFieldView', floatingLabel: false, mode: 'read-only' }
          </div>
          $$tags{ model_: 'foam.ui.md.TextFieldView', floatingLabel: false, mode: 'read-only' }
        </div>
      </div>
    */},
    function CSS() {/*
      .events-detail-view {
        display: flex;
        flex-direction: column;
        padding: 16px;
        background: #c9c9c9;
      }

      .events-detail-view .description-box {
        background: #77F;
        color: white;
      }

    */},
  ],

});
