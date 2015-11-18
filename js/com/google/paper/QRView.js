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
  name: 'QRView',

  requires: [
    'com.public.qrgenerator.QRGenerator',
  ],

  extends: 'foam.ui.SimpleView',

  properties: [
    {
      name: 'QrEncoder',
      factory: function() {
        var r = this.QRGenerator.create();
        return r.qrcode;
      }
    },
    {
      name: 'data',
      adapt: function(old, nu) {
        if ( nu instanceof Uint8Array ) {
          //return Array.prototype.slice.call(nu);
          //return this.byteArrayToStr(nu);
          //return this.utf8ArrayToStr(nu);
          //return this.bytesTo7BitPerCharStr(nu);
        }
        return nu;
      },
      postSet: function(old,nu) {
        if ( ! this.$ ) return;
        console.log("qr:",nu);

        var dataURL = this.QrEncoder.generatePNG(nu);
        console.log(dataURL);
        //this.$.appendChild(svg);
        this.$.src = dataURL;
      }

    }
  ],

  templates: [
    function toHTML() {/*
      <img id="%%id" <%= this.cssClassAttr() %> >
    */}

  ],

  methods: [
    function bytesTo7BitPerCharStr(array) {
      var l = array.length;
      for (var i=0; i < l; ++i) {

      }
    },
    function byteArrayToStr(array) {
      var ret = '';
      var l = array.length;
      for (var i=0; i < l; ++i) {
        ret += String.fromCharCode(array[i]);
      }
      return ret;
    },
    function utf8ArrayToStr(array) {
      var c, c2, c3;
      var ret = '';
      var l = array.length;
      for (var i=0; i < l; ++i) {
        c = array[i];
        var testC = c >> 4;
        if ( testC >= 0 && testC <= 7 ) {
          ret += String.fromCharCode(c);
        } else if ( testC >= 12 && testC <= 13 ) {
          c2 = array[++i];
          ret += String.fromCharCode(( (c & 0x1F) << 6) | (c2 & 0x3F) );
        } else if ( testC == 14) {
          c2 = array[++i];
          c3 = array[++i];
          ret += String.fromCharCode(
            ((c & 0x0F) << 12) |
            ((c2 & 0x3F) << 6) |
            ((c3 & 0x3F) << 0)
          );
        }
      }
      return ret;
    }

  ],

});