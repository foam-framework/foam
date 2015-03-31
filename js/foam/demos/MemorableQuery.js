CLASS({
  name: 'MemorableQuery',
  package: 'foam.demos',
  properties: [
    {
      name: 'queryParser',
      transient: true,
      hidden: true,
    },
    {
      name: 'query',
      hidden: true,
      memorable: true,
      postSet: function(_, q) {
        console.log("Query is now:", q.toSQL ? q.toSQL() : '');
      }
    },
    {
      name: 'memento',
      transient: true,
      hidden: true,
      memorable: false
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.addPropertyListener('query', this.updateMemento);
      this.addPropertyListener('memento', this.updateFromMemento);

      if ( this.hasOwnProperty('memento') )
        this.updateFromMemento(null, null, null, this.memento);
      else
        this.updateMemento();
    }
  },
  listeners: [
    {
      name: 'updateMemento',
      code: function() {
        var memento = {
          query: this.query.toMQL ? this.query.toMQL() : ''
        };

        if ( this.memento &&
             this.memento.query &&
             memento.query === this.memento.query ) return;

        this.memento = memento;
      }
    },
    {
      name: 'updateFromMemento',
      code: function(src, topic, old, memento) {
        this.query = this.queryParser.parseString(memento.query) || '';
      }
    }
  ]
});
