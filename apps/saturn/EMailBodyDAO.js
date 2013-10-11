

var EMailBodyDAO = FOAM({
   model_: 'Model',
   extendsModel: 'ProxyDAO',

   name: 'EMailBodyDAO',

   properties: [
      {
         name: 'bodyDAO',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true,
         transient: true
      }
   ],

   methods: {
      LOADING_MSG: '',

      put: function(obj, sink) {
         var body = EMail.create({id: obj.id, body: obj.body});
         obj.body = '';
         this.delegate.put(obj, sink);

         // If we haven't loaded the body of Email yet,
         // then don't save the fake body into the bodyDAO.
         if ( body.body != this.LOADING_MSG ) this.bodyDAO.put(body);
      },
      find: function(key, sink) {
         var self = this;

         this.delegate.find(key, {
            __proto__: sink,
            put: function(email) {
               if ( email.body ) {
                  sink.put && sink.put(email);
                  return;
               }
               // TODO: set a timeout to set the message to "Loading..." after some small delay, say 200ms.
               email.body = self.LOADING_MSG;
               sink.put && sink.put(email);
               self.bodyDAO.find(key, { put: function(body) {
                  email.body = body.body;
               }});
            }
         });
      }
   }
});
