String.fromCharCode = (function() {
  var oldLookup = String.fromCharCode;
  var lookupTable = [];
  return function(a) {
    if (arguments.length == 1) return lookupTable[a] || (lookupTable[a] = oldLookup(a));
console.log('.');
    var result = "";
    for (var i = 0; i < arguments.length; i++) {
      result += lookupTable[arguments[i]] || (lookupTable[arguments[i]] = oldLookup(arguments[i]));
    }
    return result;
  };
})();

var IncrementalUtf8 = {
  create: function() {
    return {
      __proto__: this,
      charcode: undefined,
      remaining: 0,
      string: ''
    };
  },

  reset: function() {
    this.string = '';
    this.remaining = 0;
    this.charcode = undefined;
  },

  put: function(byte) {
    if (this.charcode == undefined) {
      this.charcode = byte;
      if (!(this.charcode & 0x80)) {
        this.remaining = 0;
        this.charcode &= 0x7f;
      } else if ((this.charcode & 0xe0) == 0xc0) {
        this.remaining = 1;
        this.charcode &= 0x1f;
      } else if ((this.charcode & 0xf0) == 0xe0) {
        this.remaining = 2;
        this.charcode &= 0x0f;
      } else if ((this.charcode & 0xf8) == 0xf0) {
        this.remaining = 3;
        this.charcode &= 0x07;
      } else if ((this.charcode & 0xfc) == 0xf8) {
        this.remaining = 4;
        this.charcode &= 0x03;
      } else if ((this.charcode & 0xfe) == 0xfc) {
        this.remaining = 5;
        this.charcode &= 0x01;
      } else throw "Bad charcode value";
    }

    if (this.remaining > 0) {
      this.charcode |= (byte & 0x7f) << (6 * (5 - this.remaining));
      this.remaining--;
    } else {
      // NOTE: Turns out fromCharCode can't handle all unicode code points.
      // We need fromCodePoint from ES 6 before this will work properly.
      // However it should be good enough for most cases.
      this.string += String.fromCharCode(this.charcode);
      this.charcode = undefined;
    }
  }
};

// WARNING: This is a hastily written UTF-8 decoder it probably has bugs.
function utf8tostring(bytes) {
    var first;
    var chars = "";
    var j = 0;
    for (var i = 0; i < bytes.length; i++) {
        var charcode = 0;
        charcode = bytes[i];
        var remaining;
        if (!(charcode & 0x80)) {
            remaining = 0;
            charcode &= 0x7f;
        } else if ((charcode & 0xe0) == 0xc0) {
            remaining = 1;
            charcode &= 0x1f;
        } else if ((charcode & 0xf0) == 0xe0) {
            remaining = 2;
            charcode &= 0x0f;
        } else if ((charcode & 0xf8) == 0xf0) {
            remaining = 3;
            charcode &= 0x07;
        } else if ((charcode & 0xfc) == 0xf8) {
            remaining = 4;
            charcode &= 0x03;
        } else if ((charcode & 0xfe) == 0xfc) {
            remaining = 5;
            charcode &= 0x01;
        } else return undefined;
        for (var j = 0; j < remaining && j + i < bytes.length; j++) {
            charcode |= (bytes[i+j] & 0x7f) << (6 * j);
        }
        // NOTE: Turns out fromCharCode can't handle all unicode code points.
        // We need fromCodePoint from ES 6 before this will work properly.
        // However it should be good enough for most cases.
        chars += String.fromCharCode(charcode);
    }
    return chars;
}

function stringtoutf8(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);

        var count = 0;
        if ( code < 0x80 ) {
            res.push(code);
            continue;
        }

        // while(code > (0x40 >> count)) {
        //     res.push(code & 0x3f);
        //     count++;
        //     code = code >> 7;
        // }
        // var header = 0x80 >> count;
        // res.push(code | header)
    }
    return res;
}
