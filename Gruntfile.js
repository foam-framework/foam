module.exports = function(grunt) {
  require('grunt-log-headers')(grunt);

  // Returns the repetitive shell commands for measuring the size.
  function sizeOptions() {
    var ret = {};
    function oneSize(file, gzip) {
      ret[file + (gzip ? '.gz' : '')] = {
        command: 'cat build/' + file + ' | ' +
            (gzip ? 'gzip -c | ' : '') +
            'wc -c',
        options: {
          gruntLogHeader: false,
          stdout: false,
          callback: function(err, stdout, stderr, cb) {
            console.log(file + (gzip ? '.gz' : '') + ':\t' + stdout.trim());
            cb();
          }
        }
      };
    }

    oneSize('foam.js', false);
    oneSize('foam.js', true);
    oneSize('foam.min.js', false);
    oneSize('foam.min.js', true);
    return ret;
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n' +
                '/* <%= grunt.option("gitRevision") %> */\n'
      },
      foam: {
        dest: 'build/foam.js',
        src: [
          'core/firefox.js',
          'core/stdlib.js',
          'core/io.js',
          'core/writer.js',
          'core/socket.js',
          'core/hash.js',
          'core/base64.js',
          'core/encodings.js',
          'core/utf8.js',
          'core/parse.js',
          'core/event.js',
          'core/JSONUtil.js',
          'core/XMLUtil.js',
          'core/context.js',
          'core/FOAM.js',
          'core/TemplateUtil.js',
          'core/AbstractPrototype.js',
          'core/ModelProto.js',
          'core/mm1Model.js',
          'core/mm2Property.js',
          'core/mm3Types.js',
          'core/mm4Method.js',
          'core/mm5Misc.js',
          'core/mm6Protobuf.js',
          'core/value.js',
          'core/view.js',
          'core/ChoiceView.js',
          'core/DetailView.js',
          'core/TableView.js',
          'core/cview.js',
          'core/RichTextView.js',
          'core/listchoiceview.js',
          'core/scroll.js',
          'core/mlang.js',
          'core/QueryParser.js',
          'core/search.js',
          'core/async.js',
          'core/oam.js',
          'core/visitor.js',
          'core/dao.js',
          'core/ClientDAO.js',
          'core/diff.js',
          'core/SplitDAO.js',
          'core/index.js',
          'core/StackView.js',
          'core/MementoMgr.js',
          'core/DAOController.js',
          'core/ThreePaneController.js',
          'core/experimental/protobufparser.js',
          'core/experimental/protobuf.js',
          'core/models.js',
          'core/touch.js',
          'core/glang.js',
          'core/oauth.js',
          'apps/mailreader/view.js',
          'apps/mailreader/email.js',
          'core/turntable.js'
        ]
      }
    },

    uglify: {
      foam: {
        src:  'build/foam.js',
        dest: 'build/foam.min.js'
      }
    },

    'git-describe': {
      foam: {}
    },

    shell: sizeOptions()
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-shell');

  // Custom logic: Read in the git metadata, and save it as a value.
  // This value is used in the concat banner.
  grunt.registerTask('loadGitData', function() {
    grunt.event.once('git-describe', function(rev) {
      grunt.option('gitRevision', rev);
    });
    grunt.task.run('git-describe');
  });

  grunt.registerTask('sizes', function() {
    grunt.task.run('shell:foam.js');
    grunt.task.run('shell:foam.js.gz');
    grunt.task.run('shell:foam.min.js');
    grunt.task.run('shell:foam.min.js.gz');
  });

  grunt.registerTask('default', ['loadGitData', 'concat', 'uglify', 'sizes']);
};

