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
  name: 'CodeSample',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  requires: [
    'EasyDAO',
    'foam.ui.ActionButton',
    'foam.flow.VirtualConsole',
    'foam.flow.VirtualConsoleView',
    'foam.flow.Editor'
  ],

  imports: [
    'document',
    'editorModel',
    // 'actionButtonModel'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'extraClassName',
      defaultValue: 'loading'
    },
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'Example'
    },
    {
      model_: 'StringProperty',
      name: 'src',
      defaultValue: 'console.log("Hello world!");'
    },
    {
      name: 'virtualConsole',
      type: 'foam.flow.VirtualConsole',
      factory: function() {
        return this.VirtualConsole.create();
      },
      view: 'foam.flow.VirtualConsoleView'
    },
    {
      model_: 'ModelProperty',
      name: 'actionButtonModel',
      factory: function() { return this.ActionButton; }
    },
    {
      name: 'editor',
      factory: function() {
        return (this.editorModel ? this.editorModel : this.Editor).create();
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) {
          old.unsubscribe(['loaded'], this.onEditorLoaded);
          old.unsubscribe(['load-failed'], this.onEditorLoadFailed);
        }
        if ( nu ) {
          nu.subscribe(['loaded'], this.onEditorLoaded);
          nu.subscribe(['load-failed'], this.onEditorLoadFailed);
        }
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( this.editor ) {
          this.editor.src = this.src;
          if ( this.editor.src$ ) this.src$ = this.editor.src$;
        }
      }
    }
  ],

  actions: [
    {
      name: 'run',
      iconUrl: 'https://www.gstatic.com/images/icons/material/system/1x/play_arrow_white_24dp.png',
      action: function() {
        debugger;
        this.virtualConsoleView.reset();
        this.virtualConsole.watchConsole();
        try {
          eval('(function(){'    + this.src + '})')();
        } catch (e) {
          this.virtualConsole.error(e.toString());
        } finally {
          this.virtualConsole.resetConsole();
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onEditorLoaded',
      todo: 'We should probably have a spinner and/or placeholder until this fires.',
      code: function() {
        // TODO(markdittmer): This should automatically updated our classname.
        // Why doesn't it?
        this.extraClassName = '';
        if ( ! this.$ ) return;
        this.$.className = this.cssClassAttr().slice(7, -1);
      }
    },
    {
      name: 'onEditorLoadFailed',
      isFramed: true,
      code: function(_, topics) {
        var editorModelName = topics[1];
        if ( editorModelName !== 'foam.flow.Editor' ) {
          this.editor = this.Editor.create();
          this.updateHTML();
          return;
        }

        // Failed to load editor: this.Editor. Just output src as textContent.
        console.error('CodeSample: Failed to load code editor');
        if ( this.$ ) {
          var container = this.$.querySelector('editors') || this.$;
          container.innerHTML = '';
          container.textContent = this.src;
          // TODO(markdittmer): This should automatically updated our classname.
          // Why doesn't it?
          this.extraClassName = '';
          this.$.className = this.cssClassAttr().slice(7, -1);
        }
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <heading>
        %%title
      </heading>
      <top-split>
        <editors>
          %%editor
        </editors>
        <actions>
          $$run{
            model_: this.actionButtonModel,
            className: 'actionButton playButton',
            color: 'white',
            font: '30px Roboto Arial',
            alpha: 1.0,
            width: 38,
            height: 38,
            radius: 18,
            background: '#e51c23'
          }
        </actions>
      </top-split>
      $$virtualConsole{
        minLines: 8,
        maxLines: 8
      }
    */},
    function CSS() {/*
      code-sample {
        display: block;
        border-radius: inherit;
      }
      code-sample > heading {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      code-sample.loading {
        display: none;
      }
      code-sample editors {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        border-bottom: 1px solid #eee;
      }
      code-sample top-split {
        display: block;
        position: relative;
        z-index: 10;
      }
      code-sample actions {
        position: absolute;
        right: 30px;
        bottom: -18px;
      }
      code-sample canvas.playButton {
        background: rgba(0,0,0,0);
        box-shadow: 2px 2px 7px #aaa;
        border-radius: 50%;
      }

      @media not print {

        aside code-sample > * {
          margin: 10px;
        }

        aside code-sample > heading {
          font-size: 25px;
          margin: 0px;
          padding: 3px 10px 3px 10px;
          background: #F4B400;
        }

      }

      @media print {

        aside code-sample > heading {
          font-size: 14pt;
        }

      }
    */}

  ]
});
