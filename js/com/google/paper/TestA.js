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
    'com.nodeca.Pako',
    'com.lazarsoft.JSQRCode',
    
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
      name: 'qrDecoder',
      factory: function() {
        var q = this.JSQRCode.create();
        return q.qrcode;
      }
    },

    {
      name: 'source',
      postSet: function(old, nu) {
        this.label = "bytes: " + nu.length +", compressed: (9)" + this.pako.deflate(nu, { level: 9 }).length + " or (6)" + this.pako.deflate(nu, { level: 6 }).length;
        
        this.qr = this.pako.deflate(nu, { level: 9 });
      }
    },
    {
      name: 'label',
    },
    {
      name: 'qr',
      
    }
  ],


});
