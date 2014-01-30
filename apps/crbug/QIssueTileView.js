var QIssueTileView = FOAM({
   model_: 'Model',

   extendsModel: 'AbstractView',

   name: 'QIssueTileView',
   label: 'QIssue Tile View',

   properties: [
      {
         name:  'browser'
      },
      {
         name:  'issue',
         type:  'QIssue'
      }
   ],

   methods: {
     // Implement Sink
     put: function(issue) { this.issue = issue; },

     // Implement Adapter
     f: function(issue) {
       return QIssueTileView.create({
         issue: issue,
         browser: this.browser});
     },

     toString: function() { return this.toHTML(); }
   },

   templates:[
     { name: 'toHTML' }
   ]
});
