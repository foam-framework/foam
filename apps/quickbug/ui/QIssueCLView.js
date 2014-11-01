MODEL({
  name: 'QIssueCLView',
  extendsModel: 'View',

  properties: [
    { name: 'dao' }
  ],

  constants: {
    patterns: [
      [
        /https:\/\/codereview.chromium.org\/(\d+)/,
        function(r) { return '<a target="_blank" href="' + r[0] + '">r' + r[1] + '</a>'; }
      ],
      [
        /<a href="https:\/\/src.chromium.org\/viewvc\/chrome\?view=rev&revision=\d+">(\d+)<\/a>/,
        function(r) { return '<a target="_blank" href="' + r[0] + '">r' + r[1] + '</a>'; }
      ],
      [
        /http:\/\/src.chromium.org\/viewvc\/blink\?view=rev&rev=(\d+)/,
        function(r) { return '<a target="_blank" href="' + r[0] + '">r' + r[1] + '</a>'; }
      ],
      [
        /<a href="\/p\/((\w|-)+)\/source\/detail\?r=(\w+)">revision (\w+)<\/a>/,
        function(r) { console.assert(false, 'Bad pattern: /source/detail'); }
      ],
    ]
  },

  methods: {
    toHTML: function() { return '<div id="' + this.id + '"></div>' },
    initHTML: function() {
      var self = this;
      var out = '';
      var urls = {}; // map of url's to avoid duplicates

      this.dao.select({put: function(comment) {
        var content = comment.content;
        for ( var i = 0 ; i < self.patterns.length ; i++ ) {
          var lines = content.split('\n');
          for ( var j = 0 ; j < lines.length ; j++ ) {
            var res = lines[j].match(self.patterns[i][0]);

            if ( res ) {
              var url = self.patterns[i][1](res);
              if ( ! urls[url] ) {
                out += url + '<br>';
                urls[url] = true;
              }
            }
          }
        }
      }})(function() { if ( self.$ ) self.$.innerHTML = out; });
    }
  }

});
