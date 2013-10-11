var ProtoWriter = {
   create: function() {
      return {
         __proto__: this,
         value_: []
      };
   },

   get value() { return new Uint8Array(this.value_); },

   varint: function(i) {
      while(i > 0x7f) {
         this.value_.push((i & 0x7f) | 0x80);
         i = Math.floor(i / Math.pow(2, 7));
      }
      this.value_.push(i);
   },

   bytes: function(b) {
      this.value_ = this.value_.concat(b);
   },

   bytestring: function(str) {
      var bytes = [];
      for (var i = 0; i < str.length; i += 2) {
         bytes.push(parseInt(str.substr(i, 2), 16));
      }
      this.bytes(bytes);
   },

   // This is suboptimal, we need a way to insert the length
   // after serializing the message.
   message: function(m) {
      var temp = ProtoWriter.create();
      var data = m.outProtobuf(temp);
      temp = temp.value_;
      this.varint(temp.length);
      this.bytes(temp);
   }
};
