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
    'foam.dao.EasyDAO',
    'EasyDAO',
    'foam.ui.ActionButton',
    'foam.flow.VirtualConsole',
    'foam.flow.VirtualConsoleView',
    'foam.flow.CodeView',
    'foam.flow.SourceCode'
  ],

  imports: [
    'document',
    'codeViewModel',
    'actionButtonModel',
    'codeViewLoadState$'
  ],
  exports: [ 'codeViewLoadState$' ],

  properties: [
    {
      name: 'codeViewModel',
      defaultValueFn: function() { return this.CodeView; }
    },
    {
      model_: 'IntProperty',
      name: 'i',
      defaultValue: 0
    },
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
      model_: 'DAOProperty',
      model: 'foam.flow.SourceCode',
      name: 'js',
      factory: function() {
        return this.EasyDAO.create({
          model: this.SourceCode,
          daoType: 'MDAO',
          seqNo: true
        });
      }
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
      defaultValueFn: function() { return this.ActionButton; }
    },
    {
      model_: 'StringProperty',
      name: 'codeViewLoadState',
      defaultValue: 'pending',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.onCodeViewLoadStateChanged();
      }
    }
  ],

  actions: [
    {
      name: 'run',
      iconUrl: 'https://www.gstatic.com/images/icons/material/system/1x/play_arrow_white_24dp.png',
      action: function() {
        this.virtualConsoleView.reset();
        this.virtualConsole.watchConsole();
        try {
          var X = this.X.sub();
          for ( this.i = 0; this.i < this.js.length; ++this.i ) {
            eval('(function(X){'    + this.js[this.i] + '}).call(null, X)');
          }
        } catch (e) {
          this.virtualConsole.onError(e.toString());
        }
        this.virtualConsole.resetConsole();
        // TODO(markdittmer): Render views.
      }
    }
  ],

  listeners: [
    {
      name: 'onCodeViewLoaded',
      todo: 'We should probably have a spinner and/or placeholder until this fires.',
      code: function() {
        // TODO(markdittmer): This should automatically update our classname.
        // Why doesn't it?
        this.extraClassName = '';
        if ( ! this.$ ) return;
        this.$.className = this.cssClassAttr().slice(7, -1);
      }
    },
    {
      name: 'onCodeViewLoadFailed',
      isFramed: true,
      code: function(_, topics) {
        // TODO(markdittmer): Rewrite this to work with a DAO of code views.
        console.assert(false, 'Failed to load code views');
        // var codeViewModelName = topics[1];
        // if ( codeViewModelName !== 'foam.flow.CodeView' ) {
        //   this.codeView = this.CodeView.create();
        //   this.updateHTML();
        //   return;
        // }

        // // Failed to load codeView: this.CodeView. Just output src as textContent.
        // console.error('CodeSample: Failed to load code view');
        // if ( this.$ ) {
        //   var container = this.$.querySelector('code-views') || this.$;
        //   container.innerHTML = '';
        //   container.textContent = this.src;
        //   // TODO(markdittmer): This should automatically update our classname.
        //   // Why doesn't it?
        //   this.extraClassName = '';
        //   this.$.className = this.cssClassAttr().slice(7, -1);
        // }
      }
    },
    {
      name: 'onCodeViewLoadStateChanged',
      code: function() {
        if ( this.codeViewLoadState === 'pending' ) return;
        if ( this.codeViewLoadState === 'loaded' ) this.onCodeViewLoaded();
        if ( this.codeViewLoadState === 'failed' ) this.onCodeViewLoadFailed();
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <heading>
        %%title
      </heading>
      <top-split>
        $$js{ model_: this.DAOListView, rowView: this.codeViewModel }
        <actions>
          $$run{
            model_: this.actionButtonModel,
            className: 'actionButton playButton',
            color: 'white',
            font: '30px Roboto, Arial',
            alpha: 1.0,
            width: 38,
            height: 38,
            radius: 18,
            background: '#e51c23'
          }
        </actions>
        <!-- TODO(markdittmer): Construct semi-hidden printable views of js's here; css class name "srcs" -->
      </top-split>
      <bottom-split>
        $$virtualConsole{
          minLines: 8,
          maxLines: 8
        }
      </bottom-split>
    */},
    function CSS() {/*
      code-sample {
        display: block;
        border-radius: inherit;
      }
      code-sample heading {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      code-sample.loading {
        display: none;
      }
      code-sample code-views {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
      }
      code-sample top-split, code-sample bottom-split {
        display: block;
        position: relative;
      }
      code-sample top-split {
        z-index: 10;
      }
      code-sample top-split::before {
        bottom: -4px;
        content: '';
        height: 4px;
        left: 0;
        position: absolute;
        right: 0;
        background-image: -webkit-linear-gradient(top,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 100%);
        background-image: linear-gradient(to bottom,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 100%);
      }
      code-sample bottom-split {
        z-index: 5;
        background: #E0E0E0;
      }
      code-sample actions {
        position: absolute;
        right: 30px;
        bottom: -18px;
        z-index: 15;
      }
      code-sample canvas.playButton {
        background: rgba(0,0,0,0);
        box-shadow: 2px 2px 7px #aaa;
        border-radius: 50%;
      }

      @media not print {

        aside code-sample heading {
          font-size: 25px;
          margin: 0px;
          padding: 10px 10px 10px 10px;
          background: #F4B400;
        }

        code-sample .srcs {
          display: none;
        }

      }

      @media print {

        code-sample heading {
          font-size: 14pt;
          margin: 6pt;
        }

        code-sample top-split {
          margin: 3pt;
        }

        code-sample code-views, code-sample actions, code-sample virtual-console {
          display: none;
        }

        code-sample .srcs {
          display: block;
          font: 14px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
          white-space: pre-wrap;
          margin: 3pt;
          page-break-inside: avoid;
        }

      }
    */}
  ]
});
