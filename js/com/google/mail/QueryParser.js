CLASS({
   "model_": "Model",
   "id": "com.google.mail.QueryParser",
   "package": "com.google.mail",
   "name": "QueryParser",
   "requires": [
      "foam.lib.email.EMail"
   ],
   "properties": [
      {
         "model_": "Property",
         "name": "parser",
         "lazyFactory": function () {
        var EMail = this.EMail;
        var parser = {
          __proto__: QueryParserFactory(EMail),

          id: sym('string'),

          labelMatch: seq(alt('label','l'), alt(':', '='), sym('valueList'))
        }.addActions({
          id: function(v) {
            return OR(
              CONTAINS_IC(EMail.TO, v),
              CONTAINS_IC(EMail.FROM, v),
              CONTAINS_IC(EMail.SUBJECT, v),
              CONTAINS_IC(EMail.BODY, v));
          },

          labelMatch: function(v) {
            var or = OR();
            var values = v[2];
            for ( var i = 0 ; i < values.length ; i++ ) {
              or.args.push(EQ(EMail.LABELS, values[i]))
            }
            return or;
          }
        });

        parser.expr = alt(
          sym('labelMatch'),
          parser.export('expr')
        );

        return parser;
      }
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
