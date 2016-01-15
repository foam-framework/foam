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
  extends: 'foam.apps.builder.DesignerView',

  requires: [
    'foam.apps.builder.AppConfigActionsView',
    'foam.apps.builder.AppConfigSheetView',
    'foam.apps.builder.kiosk.AdvancedInfoWizard',
    'foam.apps.builder.kiosk.BasicInfoWizard',
    'foam.apps.builder.kiosk.ChromeWizard',
    'foam.apps.builder.kiosk.DeviceInfoWizard',
    'foam.apps.builder.kiosk.KioskView',
    'foam.ui.SwipeAltView',
    'foam.ui.ViewChoice',
    'foam.ui.md.FlatButton',
    'foam.ui.md.HaloView',
  ],
  imports: [
    'stack',
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
      type: 'String',
      name: 'url',
    },
    {
      type: 'ViewFactory',
      name: 'panel',
      defaultValue: {
        factory_: 'foam.ui.md.PopupView',
        cardClass: 'kiosk-designer-config',
        layoutPosition: 'bottom',
        animationStrategy: 'bottom',
        dragHandleHeight: 56,
        delegate: {
          factory_: 'foam.apps.builder.AppConfigSheetView',
          innerView: function() {
            // this = foam.apps.builder.AppConfigSheetView instance.
            var viewModels = [
              'foam.apps.builder.kiosk.BasicInfoWizard',
              'foam.apps.builder.kiosk.ChromeWizard',
              'foam.apps.builder.kiosk.DeviceInfoWizard',
              'foam.apps.builder.kiosk.AdvancedInfoWizard',
            ];
            var SwipeAltView = this.Y.lookup('foam.ui.SwipeAltView');
            var ViewChoice = this.Y.lookup('foam.ui.ViewChoice');
            // SwipeAltView (but NOT its "views" array): Lookup non-MD
            // ChoiceListView for slider header.
            var swipeAltViewX = this.Y.sub();
            swipeAltViewX.registerModel(X.lookup('foam.ui.ChoiceListView'),
                                        'foam.ui.ChoiceListView');
            return SwipeAltView.create({
              views: viewModels.map(function(modelName) {
                var view = this.Y.lookup(modelName).create({
                  showWizardHeading: false,
                  showWizardInstructions: false,
                  showWizardActions: false,
                  data$: this.data$
                }, this.Y); // this.Y: Default MD/non-MD views
                return ViewChoice.create({
                  label: view.title,
                  view: view,
                }, this.Y);
              }.bind(this)),
            }, swipeAltViewX);
          },
        },
      },
    },
    {
      type: 'ViewFactory',
      name: 'app',
      defaultValue: {
        factory_: 'foam.apps.builder.AppConfigActionsView',
        delegate: 'foam.apps.builder.kiosk.KioskView',
      },
    },
  ],

  actions: [
    {
      name: 'editButton',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbElEQVQ4y2NgGHrgv/f/L//7SVH+4z8ITCZWQ8V/GOgnxvRYIFkD1fCWGMf8/R8H1fLtvyt+5V5Qt0O0VBCrHKIllpBjkJUT4RhPSpR/H1jlHpQpdyMUlKQpB2ogTTmShu//3YlLxqQpH1wAAKOW8ZUUAHC/AAAAAElFTkSuQmCC',
      ligature: 'mode_edit',
      code: function() {
        // TODO(markdittmer): This generally renders inside an UpdateDetailView
        // that occupies the full height we wish to overlay. We should probably
        // have a more rigerous way of selecting the right view/DOM element
        // here.
        var overlayParent = (this.parent ? this.parent.$ : this.$) || this.$;
        this.panelView.open(overlayParent);
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
             }), 'foam.ui.ActionButton'); %>
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
               return this.panelView.state !== 'closed';
             }.bind(this), this.editButtonView.id); %>
        </div>
      </designer>
    */},
    function CSS() {/*
      .kiosk-designer-config app-config {
        position: initial;
      }
      .popup-view-container .kiosk-designer-config {
        max-width: initial;
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
      .swipeAltInner wizard {
        overflow-y: auto;
        overflow-x: hidden;
      }
    */},
  ],
});
