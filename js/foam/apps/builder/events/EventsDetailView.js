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

  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.ImageView',
    'foam.ui.StringArrayView',
    'foam.ui.md.ColorFieldView',
    'foam.ui.DAOKeyView',
  ],

  properties: [
    ['className', 'events-detail-view'],
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class='md-card-shell'>
          <div class="img-content">
            $$image{ model_: 'foam.ui.ImageView' }
          </div>
          $$name{ model_: 'foam.ui.md.TextFieldView', floatingLabel: false, mode: 'read-only', extraClassName: 'md-subhead' }
          $$date{ model_: 'foam.ui.md.TextFieldView', floatingLabel: false, mode: 'read-only' }
          $$presenters
          <div class="description-box" style="background: <%= this.data.color %>">
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
      }

      .events-detail-view .img-content {
        max-height: 400px;
        overflow-y: hidden;
      }

      .events-detail-view img {
        max-width: 100%;
      }

      .events-detail-view .description-box {
        background: #7777FF;
        color: white;
      }

    */},
  ],

});
