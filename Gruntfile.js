module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'uglify']);
};

