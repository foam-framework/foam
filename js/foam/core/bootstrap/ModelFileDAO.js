MODEL({
  name: 'ModelFileDAO',
  package: 'foam.core.bootstrap',
  methods: {
    find: function (key, sink) {
      var X = this.X;
      var model = FOAM.lookup(key, X);

      var tag = this.X.document.createElement('script');
      tag.src = FOAM_BOOT_DIR + '../js/' + key.replace(/\./g, '/') + '.js';
      this.X.document.head.appendChild(tag);

      tag.onload = function() {
//        this.removeChild(tag);

        model = FOAM.lookup(key, X);
        if ( ! model ) {
          sink && sink.error && sink.error('Model load failed for: ', key);
          return;
        }
        sink && sink.put && sink.put(model);
      }.bind(this.X.document.head);
    }
  }
});

X.ModelDAO = X.foam.core.bootstrap.ModelFileDAO.create();
