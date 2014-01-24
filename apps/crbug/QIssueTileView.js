var QIssueTileView = FOAM({
   model_: 'Model',

   extendsModel: 'AbstractView',

   name: 'QIssueTileView',
   label: 'QIssue Tile View',

   properties: [
      {
         name:  'issue',
         label: 'Issue',
         type:  'QIssue'
      }
   ],

   methods: {
     // Implement Sink
     put: function(issue) { this.issue = issue; },

     // Implement Adapter
     f: function(issue) { return QIssueTileView.create({issue: issue}); },

     toString: function() { return this.toHTML(); }
   },

   templates:[
     {
        model_: 'Template',

        name: 'toHTML',
        description: 'TileView'
     }
   ]
});
