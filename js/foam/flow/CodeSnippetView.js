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
  package: 'foam.flow',
  name: 'CodeSnippetView',
  extends: 'foam.flow.Element',

  requires: [
    'foam.ui.ActionButton',
    'foam.flow.CodeView',
    'foam.flow.CodeSnippet'
  ],
  imports: [
    'actionButtonName',
    'codeViewName',
    'codeViewLoadState$'
  ],
  exports: [ 'codeViewLoadState' ],

  constants: { ELEMENT_NAME: 'code-snippet' },

  properties: [
    {
      type: 'String',
      name: 'extraClassName',
      defaultValue: 'loading'
    },
    {
      type: 'String',
      name: 'mode',
      defaultValue: 'read-write'
    },
    {
      type: 'Boolean',
      name: 'showActions',
      defaultValue: true
    },
    {
      type: 'Boolean',
      name: 'scroll',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'codeViewLoadState',
      defaultValue: 'unloaded',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.onCodeViewLoadStateChanged();
      }
    },
    {
      type: 'String',
      name: 'codeViewName',
      defaultValue: 'foam.flow.CodeView'
    },
    {
      type: 'Model',
      name: 'actionButtonName',
      defaultValue: 'foam.ui.ActionButton'
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);

        // TODO(markdittmer): Should be able to use foam.ui.ModeProperty here
        // but it doesn't seem to be working. It should eliminate the need for
        // a postSet.
        Events.dynamicFn(function() {
          this.srcView; this.mode; this.scroll;
          if ( ! this.srcView ) return;
          this.srcView.mode = this.mode;
          this.srcView.scroll = this.scroll;
        }.bind(this));
      }
    },
    {
      name: 'isLoadedOrFailed',
      code: function() {
        var state = this.codeViewLoadState;
        return state === 'loaded' || state === 'failed';
      }
    }
  ],

  listeners: [
    {
      name: 'onCodeViewLoadFailed',
      isFramed: true,
      code: function(_, topics) {
        console.warn('Failed to load code view: ' + this.codeViewName);
        this.codeViewName = 'foam.flow.CodeView';
        this.extraClassName = '';
        this.updateHTML();
      }
    },
    {
      name: 'onCodeViewLoadStateChanged',
      code: function() {
        if ( this.codeViewLoadState !== 'failed' ) return;
        this.onCodeViewLoadFailed();
      }
    },
    {
      name: 'onEditActionFlareStateChanged',
      code: function(_, __, ___, nu) {
        if ( nu === 'default' ) {
          this.enterReadWriteMode_();
          this.editView.halo.state_$.removeListener(this.onEditActionFlareStateChanged);
        }
      }
    },
    {
      name: 'enterReadWriteMode_',
      code: function() {
        // Button should hide before editor changes modes.
        this.editView.className = (this.editView.className || '') + ' hide';
        this.mode = 'read-write';
      }
    }
  ],

  actions: [
    {
      name: 'edit',
      iconUrl: 'https://www.gstatic.com/images/icons/material/system/1x/mode_edit_black_18dp.png',
      isEnabled: function() { return this.mode === 'read-only'; },
      isAvailable: function() { return this.mode === 'read-only'; },
      code: function() {
        // TODO(markdittmer): Components involved in animated reactive updates
        // should be better decoupled. For now, use halo as indicator that we
        // need to synchronize with a flare state change.
        if ( this.editView.halo ) {
          this.editView.halo.state_$.addListener(this.onEditActionFlareStateChanged);
          return;
        }
        this.enterReadWriteMode_();
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <%
        this.setClass('loading', function() {
          this.codeViewLoadState;
          return ! this.isLoadedOrFailed();
        }.bind(this), this.id);
      %>
      <% if ( this.data.title ) { %>
        <heading>{{{this.data.title}}}</heading>
      <% } %>
      $$src{ model_: this.codeViewName }
      <% if ( this.showActions ) { %>
        <actions>
          $$edit{
            model_: this.actionButtonName,
            className: 'actionButton editButton',
            color: 'black',
            font: '20px Roboto, Arial',
            alpha: 1.0,
            radius: 15,
            background: '#F7CB4D'
          }
        </actions>
      <% } %>
    */},
    function CSS() {/*
      code-snippet {
        display: block;
        position: relative;
      }
      code-snippet.loading * {
        display: none;
      }
      code-snippet.loading heading {
        display: initial;
      }
      code-sample code-snippet actions, code-snippet actions {
        position: absolute;
        right: 30px;
        bottom: -15px;
        z-index: 15;
      }
      code-snippet canvas.editButton {
        background: rgba(0,0,0,0);
        box-shadow: 2px 2px 7px #aaa;
        border-radius: 50%;
      }
      code-snippet canvas.editButton.hide {
        display: none;
      }

      @media not print {

        aside code-sample code-snippet heading,
        code-sample code-snippet heading,
        code-snippet heading {
          background: initial;
          padding: 5px 20px;
          font-size: 18px;
          border-top: 1px solid #E0E0E0;
        }

        aside code-sample code-snippet heading,
        code-sample code-snippet heading,
        code-snippet heading {
          z-index: 10;
          position: relative;
        }

        code-snippet heading::after {
          bottom: -4px;
          content: '';
          height: 4px;
          left: 0;
          position: absolute;
          right: 0;
          background-image: -webkit-linear-gradient(top,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 100%);
          background-image: linear-gradient(to bottom,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 100%);
        }

      }

      @media print {

        aside code-sample code-snippet heading,
        code-sample code-snippet heading,
        code-snippet heading {
          margin: 3pt;
          font-size: 13pt;
        }

      }
    */}
  ]
});
