var $documents = [];

if ( window ) $documents.push(window.document);

// TODO: clean this up, hide $WID__ in closure
var $WID__ = 0;
function $addWindow(w) {
   w.window.$WID = $WID__++;
   $documents.push(w.document);
}
function $removeWindow(w) {
   for ( var i = $documents.length - 1 ; i >= 0 ; i-- ) {
      if ( $documents[i].defaultView === w )
         $documents.splice(i,1);
   }
}
var $ = function () {
   for ( var i = 0 ; i < $documents.length ; i++ ) {
      var d = $documents[i];
      var ret = d.getElementById.apply(d, arguments);

      if ( ret ) return ret;
   }
   return undefined;
};
var $$ = function () {
   for ( var i = 0 ; i < $documents.length ; i++ ) {
      var d = $documents[i];
      var ret = d.getElementsByClassName.apply(d, arguments);

      if ( ret.length > 0 ) return ret;
   }
   return [];
};


var FOAM = function(map) {
   var obj = JSONUtil.mapToObj(map);
   return obj;
};

FOAM.create = function(map) {
   console.log('FOAM.create() is deprecated.  Use FOAM() instead.');
   var obj = JSONUtil.mapToObj(map);
   return obj;
};
/**
 * Register a lazy factory for the specified name within a
 * specified context.
 * The first time the name is looked up, the factory will be invoked
 * and its value will be stored in the named slot and then returned.
 * Future lookups to the same slot will return the originally created
 * value.
 **/
FOAM.putFactory = function(ctx, name, factory) {
   ctx.__defineGetter__(name, function() {
      console.log("Bouncing Factory: ", name);
      delete ctx[name]; // delete getter
      return ctx[name] = factory();
   });
};

FOAM.browse = function(model, opt_dao) {
   var dao = opt_dao || GLOBAL[model.name + 'DAO'] || GLOBAL[model.plural];

   if ( ! dao ) {
      dao = StorageDAO.create({ model: model });
      GLOBAL[model.name + 'DAO'] = dao;
   }

   var ctrl = ActionBorder.create(DAOController, DAOController.create({
      model:     model,
      dao:       dao
   }));

   ctrl.__proto__.stackView = GLOBAL.stack;
   GLOBAL.stack.pushView(ctrl, model.plural);
};
