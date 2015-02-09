CLASS({
  name: "BuildApp",
  package: 'foam.build',
  imports: [
    'log',
    'error'
  ],
  requires: [
    'foam.dao.NodeFileDAO as FileDAO',
    'foam.dao.File'
  ],
  properties: [
    {
      name: 'controller',
      required: true
    },
    {
      name: 'defaultView'
    },
    {
      name: 'targetPath',
      require: true
    },
    {
      name: 'path',
      factory: function() { return require('path'); }
    },
    {
      name: 'fileDAO',
      factory: function() { return this.FileDAO.create(); }
    }
  ],
  methods: {
    execute: function() {
      if ( ! this.targetPath ) {
        this.error("targetPath is required");
        process.exit(1);
      }
      if ( ! this.controller ) {
        this.error("controller is required");
        process.exit(1);
      }
      arequire(this.controller)(this.execute_.bind(this));
    },
    buildCoreJS_: function(ret) {
      var i = 0;
      var self = this;
      var corejs = '';
      var file;
      awhile(
        function() { return i < files.length; },
        aif(
          function() {
            file = files[i++];
            if ( Array.isArray(file) ) {
              if ( file[1] != IN_BROWSER ) return false;
              file = file[0];
            }
            return true;
          },
          aseq(
            function(ret) {
              var path = FOAM_BOOT_DIR + this.path.sep + file + '.js';
              this.fileDAO.find(path, {
                put: ret,
                error: function() {
                  self.error.apply(["Error reading file: ", path].concat(arguments));
                }
              });
            }.bind(this),
            function(ret, file) {
              corejs += '// Copied from ' + file.path;
              corejs += '\n';
              corejs += file.contents;
              ret();
            })))(function() { ret(corejs); });
    },
    buildAppJS_: function(ret) {
      var models = {};
      var visited = {};
      var error = this.error;

      (function add(require) {
        if ( visited[require] ) return;
        visited[require] = true;

        var model = FOAM.lookup(require, X);
        if ( ! model ) {
          error("Could not load model: ", require);
        }
        if ( model.package ) models[model.id] = model;

        model.getAllRequires().forEach(add);
      })(this.controller);

      var contents = '';

      var ids = Object.keys(models);
      this.fileDAO.put(this.File.create({
        path: this.targetPath + this.path.sep + 'MANIFEST',
        contents: ids.join('\n')
      }));
      for ( var i = 0; i < ids.length; i++ ) {
        contents += 'CLASS(';
        contents += JSONUtil.compact.where(NOT_TRANSIENT).stringify(models[ids[i]]);
        contents += ')\n';
      }

      ret(contents);
    },
    execute_: function(model) {
      if ( ! model ) {
        this.error("Could not find model: ", this.controller);
      }
      this.log("Building   ", model.id);
      this.log("Target is: ", this.targetPath);

      var self = this;
      aseq(
        function(ret) {
          var file = this.File.create({
            path: this.targetPath + this.path.sep + 'main.html',
            contents: this.HTML()
          });

          console.log("Writing: ", file.path);
          this.fileDAO.put(file, {
            put: ret,
            error: function() {
              self.error('ERROR writing file: ', file.path);
              process.exit(1);
            }
          });
        }.bind(this),
        apar(
          function(ret) { this.buildCoreJS_(ret); }.bind(this),
          function(ret) { this.buildAppJS_(ret); }.bind(this)),
        function(ret, corejs, appjs) {
          var file = this.File.create({
            path: this.targetPath + this.path.sep + 'foam.js',
            contents: corejs + appjs
          });
          console.log("Writing: ", file.path);
          this.fileDAO.put(file, {
            put: ret,
            error: function() {
              self.error("ERROR writing file: ", file.path);
              process.exit(1);
            }
          });
        }.bind(this)
      )(
        function(){
          process.exit(0);
        });
    }
  },
  templates: [
    function HTML() {/*<html><head><script src="foam.js"></script></head><body><foam model="<%= this.controller %>"<% if ( this.defaultView ) { %> view="<%= this.defaultView %>"<% } %>></foam></body></html>*/}
  ]
});
