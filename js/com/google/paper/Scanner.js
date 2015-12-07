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
  package: 'com.google.paper',
  name: 'Scanner',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'com.google.paper.VideoCaptureView',
    'com.nodeca.pako.Pako',
    'com.lazarsoft.jsqrcode.JSQRCode',
    'foam.ui.md.FlatButton',
  ],
  
  imports: [
    'loadedCodeBaseContext',
  ],

  properties: [
    {
      name: 'modelReady',
      help: 'The listener to call when a scanned model is loaded.',
      defaultValue: function(model) { console.log("Loaded ", model.id); },
    },
    {
      name: 'pako',
      hidden: true,
      factory: function() {
        var p = this.Pako.create();
        return p.pako;
      }
    },
    {
      name: 'QrDecoder',
      hidden: true,
      factory: function() {
        var r = this.JSQRCode.create();
        this.compressedSource$ = r.data$;
        return r.qrcode;
      }
    },
    {
      name: 'dataURL',
      postSet: function(old,nu) {
        this.QrDecoder.decode(nu);
      },
      view: 'com.google.paper.VideoCaptureView',
    },
    {
      name: 'compressedSource',
      hidden: true,
      postSet: function(old,nu) {
        try {
          this.data = this.pako.inflate(nu, { to: 'string' });
        } catch (e) {
          console.log("Inflate failed",e);
        }
      }
    },
    {
      name: 'data',
      hidden: true,
      postSet: function(old, nu) {
        if ( nu ) {
          var X = this.loadedCodeBaseContext;
          try {
            eval('(function(X, CLASS){' + nu + '}).call(null, X, X.CLASS)');
            this.message = "Success!";
            if ( this.dataURLView ) this.dataURLView.enabled = false;
          } catch (e) {
            this.message = "Data error: " + e.toString();
          }
        } else {
          this.message = "No Data!";
        }
      },
    },
    {
      name: 'message',
      mode: 'read-only',
      defaultValue: 'No Data.',
      postSet: function(old,nu) {
        console.log(nu);
      },
    },
  ],
  
  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.FlatButton, 'foam.ui.ActionButton');
    }
  ],
  
  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-flex-col">
          $$dataURL
          $$message
        </div>
      </div>
    */},
    function CSS() {/*
      .property-edit-view {
        display: flex;
        flex-direction: column;
        align-content: baseline;
        flex-grow: 1;
        background: white;
      }
      .property-edit-view .md-flex-row {
        overflow: none;
        align-content: baseline;
      }
    */},

  ]
  
  
});
