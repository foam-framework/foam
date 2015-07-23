/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
  package: 'foam.dao',
  name: 'EasyClientDAO',
  extendsModel: 'foam.dao.ProxyDAO',
  requires: [
    'XHR',
    'foam.core.dao.ClientDAO'
  ],
  properties: [
    {
      name: 'serverUri',
    },
    {
      name: 'model'
    },
    {
      name: 'delegate',
      factory: function() {
	return this.ClientDAO.create({
	  asend: this.asend.bind(this),
	  model: this.model
	});
      }
    }
  ],
  methods: [
    function asend(ret, data) {
      var json = JSONUtil.where(function(prop, obj) {
	if ( Property.isInstance(obj) &&
	     prop.name !== 'name' &&
	     prop.name !== 'modelId' ) {
	  return false;
	}
	return true;
      });

      aseq(
	function(ret) {
	  var xhr = this.XHR.create();
	  xhr.asend(ret, this.serverUri, json.stringify(data), 'POST');
	}.bind(this),
	function(ret, resp, _, success) {
	  if ( ! success ) {
	    ret(null);
	    return;
	  }
	  if ( IN_CHROME_APP() ) {
	    aeval("(" + resp + ")")(function(data) {
	      ret(JSONUtil.parse(this.X, data));
	    }.bind(this));
	    return;
	  }

	  ret(JSONUtil.parse(this.X, resp));
	}
      )(ret)
    }
  ]
});
