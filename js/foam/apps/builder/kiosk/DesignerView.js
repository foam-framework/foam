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
  package: 'foam.apps.builder.kiosk',
  name: 'DesignerView',
  extendsModel: 'foam.apps.builder.DesignerView',

  requires: [
    'foam.apps.builder.AppConfigDetailView',
    'foam.apps.builder.AppConfigSheetView',
    'foam.apps.builder.Preview',
    'foam.apps.builder.kiosk.KioskView',
    'foam.ui.md.FlatButton',
    'foam.ui.md.HaloView',
  ],

  exports: [
    'url$',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'kiosk-designer',
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unfollow(old.homepage$, this.url$);
        if ( nu ) Events.follow(nu.homepage$, this.url$);
      },
    },
    {
      model_: 'StringProperty',
      name: 'url',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'panel',
      defaultValue: {
        factory_: 'foam.ui.md.PopupView',
        cardClass: '',
        layoutPosition: 'bottom',
        animationStrategy: 'bottom',
        delegate: {
          factory_: 'foam.apps.builder.AppConfigSheetView',
          minHeight: 400,
          innerView: 'foam.apps.builder.AppConfigDetailView',
        },
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'app',
      defaultValue: 'foam.apps.builder.kiosk.KioskView',
    },
  ],

  actions: [
    {
      name: 'editButton',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbElEQVQ4y2NgGHrgv/f/L//7SVH+4z8ITCZWQ8V/GOgnxvRYIFkD1fCWGMf8/R8H1fLtvyt+5V5Qt0O0VBCrHKIllpBjkJUT4RhPSpR/H1jlHpQpdyMUlKQpB2ogTTmShu//3YlLxqQpH1wAAKOW8ZUUAHC/AAAAAElFTkSuQmCC',
      ligature: 'mode_edit',
      code: function() {
        this.panelView.open(this.$);
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <designer id="%%id" <%= this.cssClassAttr() %>>

        <% this.panelView = this.panel({
             zIndex: 2,
           }, this.Y);
           this.appView = this.app({
             zIndex: 1,
           }, this.Y);
           this.addDataChild(this.panelView);
           this.addDataChild(this.appView); %>

        <%= this.panelView %>
        <%= this.appView %>

        <div class="floating-action">
          <% var editButtonX = this.Y.sub();
             editButtonX.registerModel(this.FlatButton.xbind({
               haloColor: 'black',
               displayMode: 'ICON_ONLY',
             }), 'foam.ui.ActionButton');
             editButtonX.registerModel(this.HaloView.xbind({
               easeInTime: 0,
               easeOutTime: 0,
             }), 'foam.ui.md.HaloView'); %>
          $$editButton{
            extraClassName: 'floatingActionButton designerEditButton',
            color: 'white',
            font: '30px Roboto Arial',
            alpha: 1,
            width: 44,
            height: 44,
            radius: 22,
            background: '#e51c23',
            X: editButtonX,
          }
          <% this.setClass('show', function() {
               return this.panelView.state === 'closed';
             }.bind(this), this.editButtonView.id); %>
          <% this.setClass('hide', function() {
               return this.panelView.state === 'open';
             }.bind(this), this.editButtonView.id); %>
        </div>
      </designer>
    */},
    function CSS() {/*
      designer.kiosk-designer .md-popup-view-content {
        flex-grow: 1;
        max-width: initial;
      }
      designer.kiosk-designer .md-popup-view-content app-config {
        position: initial;
      }
      @keyframes zoom-in {
        0% {
          transform: scale(0);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes zoom-out {
        0% {
          transform: scale(1);
        }
        100% {
          transform: scale(0);
        }
      }
      @keyframes spin-in {
        0% {
          transform: rotate(360deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }
      @keyframes spin-out {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      designer.kiosk-designer .designerEditButton {
        z-index: 2000;
        transform: scale(0) rotate(360deg);
      }
      designer.kiosk-designer .designerEditButton.show {
        animation-name: zoom-in;
        animation-duration: .2s;
        animation-timing-function: cubic-bezier(.5,.5,.2,1);
        animation-fill-mode: forwards;
      }
      designer.kiosk-designer .designerEditButton.hide {
        animation-name: zoom-out;
        animation-duration: .2s;
        animation-timing-function: cubic-bezier(.5,.5,1,.2);
        animation-fill-mode: forwards;
      }
      designer.kiosk-designer .designerEditButton.show icon {
        animation-name: spin-in;
        animation-duration: .2s;
        animation-timing-function: cubic-bezier(.5,.5,.2,1);
        animation-fill-mode: forwards;
      }
      designer.kiosk-designer .designerEditButton.hide icon {
        animation-name: spin-out;
        animation-duration: .2s;
        animation-timing-function: cubic-bezier(.5,.5,.2,1);
        animation-fill-mode: forwards;
      }
    */},
  ],
});
