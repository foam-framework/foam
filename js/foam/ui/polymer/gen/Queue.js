CLASS({
  name: 'Queue',
  package: 'foam.ui.polymer.gen',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'flushing',
      defaultValue: true
    },
    {
      name: 'data_',
      factory: function() { return []; }
    },
    {
      name: 'cursor_',
      defaultValue: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(data) {
        this.data_.push(data);
      }
    },
    {
      name: 'get',
      code: function(data) {
        if ( this.cursor_ >= this.data_.length ) {
          if ( this.cursor_ !== 0 ) {
            if ( this.flushing ) {
              this.data_ = [];
            }
            this.cursor_ = this.data_.length;
          }
          return undefined;
        }

        var rtn = this.data_[this.cursor_];
        ++this.cursor_;
        if ( this.cursor_ >= this.data_.length ) {
          if ( this.flushing ) {
            this.data_ = [];
          }
          this.cursor_ = this.data_.length;
        }
        return rtn;
      }
    }
  ]
});
