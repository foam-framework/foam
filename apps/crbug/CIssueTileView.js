var CIssueTileView = FOAM({
   model_: 'Model',

   extendsModel: 'AbstractView',

   name: 'CIssueTileView',
   label: 'CIssue Tile View',

   properties: [
      {
         name:  'issue',
         label: 'Issue',
         type:  'CIssue'
      }
   ],

   methods: {
     // Implement Sink
     put: function(issue) { this.issue = issue; },

     // Implement Adapter
     f: function(issue) { return CIssueTileView.create({issue: issue}); },

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
