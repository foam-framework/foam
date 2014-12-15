CLASS({
   "model_": "Model",
   "id": "node.dao.JSModelFileDAO",
   "package": "node.dao",
   "name": "JSModelFileDAO",
   "extendsModel": "AbstractDAO",
   "requires": [],
   "imports": [],
   "exports": [],
   "properties": [
      {
         "model_": "Property",
         "name": "daoListeners_",
         "hidden": true,
         "transient": true,
         "factory": function () { return []; }
      },
      {
         "model_": "Property",
         "name": "fs",
         "factory": function () { return require('fs'); }
      },
      {
         "model_": "Property",
         "name": "path",
         "factory": function () { return require('path'); }
      },
      {
         "model_": "StringProperty",
         "name": "prefix",
         "defaultValueFn": function () {
        return 'js';
      }
      }
   ],
   "actions": [],
   "constants": [],
   "methods": [
      {
         "model_": "Method",
         "name": "put",
         "code": function (obj, sink) {
      var path = 
        this.path.normalize(this.prefix + this.path.sep +
                            obj.package.replace(/\./g, this.path.sep) +
                            this.path.sep + obj.name + '.js');

      var current = '';
      var parts = path.split(this.path.sep);
      var fs = this.fs;
      var i = 0;
      var self = this;

      var size;
      var buffer;

      aseq(
        awhile(function() { return i < parts.length - 1; },
               aseq(
                 function(ret) {
                   current += parts[i++] + self.path.sep;
                   fs.stat(current, ret);
                 },
                 function(ret, err, data) {
                   if ( err ) {
                     if ( err.code == 'ENOENT' ) {
                       fs.mkdir(current, ret);
                       return;
                     }

                     sink && sink.error && sink.error(err);
                     return;
                   }

                   if ( ! data.isDirectory() ) {
                     sink && sink.error && sink.error(current, ' should be a directory or not exist.');
                     return;
                   }

                   ret();
                 })),
          aseq(
            function(ret) {
              current += parts[i];
              console.log("Writing to ", current);
              fs.open(current, "w", ret);
            },
            function(ret, err, fd) {
              if ( err ) {
                sink && sink.error && sink.error("Could not open ", current, " for writing. ", err);
                return;
              }

              var buffer = new Buffer("CLASS(" + obj.toJSON() + ");\n");
              var offset = 0;

              awhile(
                function() { return offset < buffer.length - 1 },
                aseq(
                  function(ret) {
                    fs.write(fd, buffer, offset, buffer.length, null, ret);
                  },
                  function(ret, err, written, buffer) {
                    if ( err ) {
                      sink && sink.error && sink.error('Write error: ', err);
                      return;
                    }
                    if ( written ) offset += written;
                    ret();
                  }))(ret);
            })
      )(function(){sink && sink.put && sink.put(obj);});
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
