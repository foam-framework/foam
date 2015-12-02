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
  name: 'TestA',

  requires: [
    'com.nodeca.pako.Pako',
    'com.lazarsoft.jsqrcode.JSQRCode',
  ],

  properties: [
    {
      name: 'pako',
      factory: function() {
        var p = this.Pako.create();
        return p.pako;
      }
    },
    {
      name: 'QrDecoder',
      factory: function() {
        var r = this.JSQRCode.create();
        this.compressedSource$ = r.data$;
        return r.qrcode;
      }
    },
    {
      name: 'source',
      postSet: function(old, nu) {
        this.label = "bytes: " + nu.length +", compressed: (9)" + this.pako.deflate(nu, { level: 9 }).length + " or (6)" + this.pako.deflate(nu, { level: 6 }).length;

        this.qr = this.pako.deflate(nu, { level: 9 });
        // silly shrink
        //this.X.setTimeout(function() { this.source = nu.slice(0, -50); }.bind(this), 20);
      }
    },
    {
      name: 'label',
    },
    {
      name: 'qr',
    },
    {
      name: 'dataURL',
      postSet: function(old,nu) {
        this.QrDecoder.decode(nu);
      }
    },
    {
      name: 'compressedSource',
      postSet: function(old,nu) {
        try {
          this.reinflated = this.pako.inflate(nu, { to: 'string' });
        } catch (e) {
          console.log("Inflate failed",e);
        }
      }
    },
    {
      name: 'reinflated'
    }
  ],


});
