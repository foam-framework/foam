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
  name: 'CodeSample',
  extends: 'foam.flow.Element',

  requires: [
    'foam.dao.EasyDAO',
    'foam.flow.CodeSampleOutput',
    'foam.flow.CodeSampleOutputView',
    'foam.flow.CodeSnippet',
    'foam.flow.CodeSnippetView',
    'foam.flow.SourceCodeListView',
    'foam.sandbox.IsolatedContext',
    'foam.ui.ActionButton'
  ],

  imports: [
    'actionButtonName',
    'codeViewName',
    'document'
  ],
  exports: [ 'sampleCodeContext' ],

  properties: [
    {
      type: 'String',
      name: 'codeViewName',
      defaultValue: 'foam.flow.CodeView'
    },
    {
      type: 'String',
      name: 'title',
      defaultValue: 'Example'
    },
    {
      model_: 'foam.core.types.DAOProperty',
      model: 'foam.flow.CodeSnippet',
      name: 'source',
      singular: 'codeSnippet',
      factory: function() {
        return this.EasyDAO.create({
          model: this.CodeSnippet,
          daoType: 'MDAO',
          autoIndex: true,
          seqNo: true,
          seqProperty: this.CodeSnippet.ORDERING
        }).orderBy(this.CodeSnippet.ORDERING);
      }
    },
    {
      name: 'output',
      // type: 'foam.flow.CodeSampleOutput',
      factory: function() {
        return this.CodeSampleOutput.create();
      },
      view: 'foam.flow.CodeSampleOutputView'
    },
    {
      type: 'Boolean',
      name: 'hasHTML',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'actionButtonName',
      defaultValue: 'foam.ui.ActionButton'
    },
    {
      type: 'Function',
      name: 'packagePath_',
      defaultValue: function(Y, path, i, opt_noCreate) {
        if ( i === path.length ) return Y;
        if ( ! Y[path[i]] && opt_noCreate ) return undefined;

        if ( ! Y.hasOwnProperty(path[i]) ) {
          if ( Y[path[i]] )
            Y[path[i]] = Object.create(Y[path[i]]);
          else
            Y[path[i]] = {};
        }

        return this.packagePath_(Y[path[i]], path, i+1, opt_noCreate);
      }
    },
    {
      type: 'Function',
      name: 'packagePath',
      defaultValue: function(X, path, opt_noCreate) {
        return path ?
          this.packagePath_(X, path.split('.'), 0, opt_noCreate) :
          this;
      }
    },
    {
      type: 'Function',
      name: 'registerModel',
      defaultValue: function(model, opt_name) {
        var root    = this;
        var name    = model.name;
        var package = model.package;

        if ( opt_name ) {
          var a = opt_name.split('.');
          name = a.pop();
          package = a.join('.');
        }

        var path = this.packagePath(root, package);
        Object.defineProperty(path, name, { value: model, configurable: true });
        return model;
      }
    },
    {
      type: 'Function',
      name: 'lookup',
      defaultValue: function(path) {
        if ( ! path ) return undefined;
        if ( typeof path !== 'string' ) return path;
        return this.packagePath(this, path, true);
      }
    },
    {
      type: 'Function',
      name: 'classFn',
      defaultValue: function(modelHash, opt_X) {
        var Y = opt_X || this;
        modelHash.package = modelHash.package || 'foam.sandbox';
        var model = Y.Model.create(modelHash, Y);
        Y.registerModel(model);
        return model;
      }
    },
    {
      name: 'sampleCodeBaseContext',
      factory: function() {
        return this.IsolatedContext.create({}, GLOBAL.X).Y.sub({
          writeView: function(view) {
            this.output.viewOutput.view = function() { return view; };
          }.bind(this)
        });
      }
    },
    {
      name: 'sampleCodeContext',
      factory: function() {
        return this.generateSampleCodeContext_();
      }
    },
    {
      name: 'state',
      documentation: function() {/* Either "hold" or "release". Used to trigger
        running sample code with respect to animations. */},
      defaultValue: 'hold'
    },
    {
      type: 'Array',
      name: 'openSnippets',
      // type: 'Array[Int]',
      lazyFactory: function() { return [-2, -1]; },
      adapt: function(old, nu) {
        if ( old === nu || ! typeof nu !== 'string' ) return nu;
        var arr = nu.split(',');
        return arr.map(function(v) {
          return parseInt(v);
        }).filter(function(i)  {
          return ! Number.isNaN(i);
        });
      }
    },
    {
      type: 'Boolean',
      name: 'running',
      defaultValue: false
    }

  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        Events.dynamicFn(function() {
          this.state; this.running;
          if ( this.running && this.state === 'release' ) this.onRun();
        }.bind(this));
      }
    },
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        var hasHTML = this.hasHTML;
        this.source.select({
          put: function(o) {
            if ( o.src ) hasHTML |= o.src.language.toLowerCase() === 'html';
          }.bind(this)
        })(function() {
          if ( ! hasHTML ) this.outputView.viewOutputView.height = 0;
        }.bind(this));
        this.run();
      }
    },
    {
      name: 'generateSampleCodeContext_',
      code: function() {
        return this.sampleCodeBaseContext.sub({});
      }
    }
  ],

  actions: [
    {
      name: 'run',
      iconUrl: 'https://www.gstatic.com/images/icons/material/system/1x/play_arrow_white_24dp.png',
      code: function() {
        this.running = true;
        this.outputView.reset();
      }
    }
  ],

  listeners: [
    {
      name: 'onRun',
      code: function() {
        this.output.virtualConsole.watchConsole();
        this.output.viewOutput.view = '';
        var X = this.sampleCodeContext = this.generateSampleCodeContext_();
        this.source.select({
          put: function() {
            // Use arguments array to avoid leaking names into eval context.
            if ( arguments[0].src && arguments[0].src.language ) {
              if ( arguments[0].src.language.toLowerCase() === 'javascript' ) {
                try {
                  eval('(function(X, CLASS){' +
                      arguments[0].src.code +
                      '}).call(null, X, X.CLASS)');
                } catch (e) {
                  this.output.virtualConsole.onError(e.toString());
                }
              } else if ( arguments[0].src.language.toLowerCase() === 'html' ) {
                // CodeSamples use <foam-tag> instead of <foam> to avoid
                // creating broken FoamTagViews.
                this.output.viewOutput.view =
                    arguments[0].src.code.replace(/<(\s*[/]\s*)?foam-tag/g, '<$1foam');
              }
            }
          }.bind(this),
          error: function(e) {
            this.output.virtualConsole.onError(e.toString());
          }.bind(this)
        })(function() {
          this.output.virtualConsole.resetConsole();
          this.running = false;
        }.bind(this));
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% if ( this.title ) { %>
        <heading>
          %%title
        </heading>
      <% } %>
      <top-split>
        $$source{
          model_: this.SourceCodeListView,
          rowView: this.CodeSnippetView,
          openViews: this.openSnippets
        }
        <actions>
          $$run{
            model_: this.actionButtonName,
            className: 'actionButton playButton',
            color: 'white',
            font: '30px Roboto, Arial',
            alpha: 1.0,
            radius: 18,
            background: '#e51c23'
          }
        </actions>
        <print-only>
          $$source{
            model_: this.SourceCodeListView,
            mode: 'read-only',
            rowView: {
              factory_: 'foam.flow.CodeSnippetView',
              scroll: false,
              codeViewName: 'foam.flow.CodeView'
            }
          }
        </print-only>
      </top-split>
      <bottom-split>
        $$output
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
      code-sample top-split, code-sample bottom-split {
        display: block;
        position: relative;
      }
      code-sample top-split {
        z-index: 10;
      }
      code-sample top-split::after {
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

        code-sample heading {
          font-size: 25px;
          margin: 0px;
          padding: 10px 10px 10px 10px;
          background: #F4B400;
          z-index: 20;
        }

        code-sample print-only {
          display: none;
        }

      }

      @media print {

        code-sample print-only, code-sample print-only sources {
          display: block;
        }

        code-sample heading {
          font-size: 14pt;
          margin: 6pt;
        }

        code-sample top-split {
          margin: 3pt;
        }

        code-sample sources, code-sample actions, code-sample virtual-console {
          display: none;
        }

        code-sample print-only sources {
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
