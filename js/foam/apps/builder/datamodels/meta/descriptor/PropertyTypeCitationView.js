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
  package: 'foam.apps.builder.datamodels.meta.descriptor',
  name: 'PropertyTypeCitationView',
  extends: 'foam.ui.md.DetailView',

  properties: [
    {
      name: 'className',
      defaultValue: 'md-property-type-citation-view',
    },
    {
      type: 'Image',
      name: 'image',
      view: {
        factory_: 'foam.ui.ImageView',
        displayWidth: 100,
        //displayHeight: 30,
      }
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( nu ) {
          this.image = '/resources/svg/' + nu.name + '.svg';
        }
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-card-shell citation-content">
          <div class="image-area">
            $$image
          </div>
          <div class="label-content">$$label{ mode: 'read-only', floatingLabel: false }</div>
        </div>
      </div>
    */},
    function CSS() {/*
      .md-property-type-citation-view {
        width: 200px;
        transition: transform 250ms ease;
      }
      .md-property-type-citation-view .citation-content {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: relative;
        height: 200px;
        margin: 16px;
      }

      .md-property-type-citation-view .label-content {
        margin: 8px;
      }

      .md-property-type-citation-view .image-area {
        background-color: lightblue;
        width: 100%;
        flex-grow: 1;
        flex-shrink: 1;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 16px;
      }

      .md-property-type-citation-view .image-area > :first-child {
        flex-grow: 0;
        flex-shrink: 1;
        transition: border 250ms ease;
      }

      .dao-selected .md-property-type-citation-view {
        transform: scale(1.1);
      }
      .dao-selected .md-property-type-citation-view .image-area > :first-child {
        border: 6px solid black;
        border-radius: 12px;
      }

    */},


  ],

});