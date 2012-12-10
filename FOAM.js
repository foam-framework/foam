/*
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var $ = function () {
  return document.getElementById.apply(document, arguments);
};


var FOAM = {

   create: function(map) {
      return JSONUtil.chaosify(map);
   },

   /**
    * Register a lazy factory for the specified name within a
    * specified context.
    * The first time the name is looked up, the factory will be invoked
    * and its value will be stored in the named slot and then returned.
    * Future lookups to the same slot will return the originally created
    * value.
    **/
   putFactory: function(ctx, name, factory) {
      ctx.__defineGetter__(name, function() {
         console.log("Bouncing Factory: ", name);
	 delete ctx[name]; // delete getter
	 return ctx[name] = factory();
      });
   },

   browse: function(model, opt_dao)
   {
      var dao = opt_dao || GLOBAL[model.name + 'DAO'] || GLOBAL[model.plural];

      if ( ! dao ) {
	 dao = StorageDAO2.create({ model: model });
	 GLOBAL[model.name + 'DAO'] = dao;
      }

      var ctrl = ActionBorder.create(DAO2Controller, DAO2Controller.create({
        model:     model,
        dao:       dao
      }));

      ctrl.__proto__.stackView = GLOBAL.stack;
      GLOBAL.stack.pushView(ctrl, model.plural);
   }

};
