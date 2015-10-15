/*
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
  name: 'WorkerDAO',
  package: 'foam.core.dao',
  extends: 'AbstractDAO',

  requires: [
    'foam.core.dao.KeyCollector'
  ],

  properties: [
    {
      name: 'model',
      type: 'Model',
      required: true
    },
    {
      name: 'delegate',
      type: 'Worker',
      help: 'The web-worker to delegate all actions to.',
      factory: function() {
        var url = window.location.protocol +
          window.location.host +
          window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
        var workerscript = [
          "var url = '" + url + "';\n",
          "var a = importScripts;",
          "importScripts = function(scripts) { \nfor (var i = 0; i < arguments.length; i++) \na(url + arguments[i]); \n};\n",
          "try { importScripts('bootFOAMWorker.js'); } catch(e) { \n console.error(e); }\n",
          "WorkerDelegate.create({ dao: [].dao });\n"
        ];
        return new Worker(window.URL.createObjectURL(
          new Blob(workerscript, { type: "text/javascript" })));
      },
      postSet: function(oldVal, val) {
        if ( oldVal ) {
          oldVal.terminate();
        }
        val.addEventListener("message", this.onMessage);
      }
    },
    {
      name:  'requests_',
      type:  'Object',
      label: 'Requests',
      help:  'Map of pending requests to delegate.',
      factory: function() { return {}; }
    },
    {
      name:  'nextRequest_',
      type:  'Int',
      label: 'Next Request',
      help:  'Id of the next request to the delegate.',
      factory: function() { return 1; }
    },
    { // Consider making this a DAO.  Challenge is keeping in sync if this throws errors after delegate has completed something.
      name:  'storage_',
      type:  'Object',
      label: 'Storage',
      help:  'Local cache of the data in the delegate.',
      factory: function() { return {}; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.delegate.postMessage("");
    },
    destroy: function() {
      // Send a message to the delegate?
      this.delegate.terminate();
    },
    makeRequest_: function(method, params, callback, error) {
      var reqid = this.nextRequest_++;
      params = params ?
        ObjectToJSON.visit(params) :
        {};
      var message = {
        method: method,
        params: params,
        request: reqid
      };
      this.requests_[reqid] = {
        method: method,
        callback: callback,
        error: error
      };
      this.delegate.postMessage(message);
    },
    put: function(obj, sink) {
      this.makeRequest_(
        "put", obj,
        (function(response) {
          this.storage_[obj.id] = obj;
          this.notify_("put", [obj]);
          sink && sink.put && sink.put(obj);
        }).bind(this),
        sink && sink.error && sink.error.bind(sink));
    },
    remove: function(query, sink) {
      this.makeRequest_(
        "remove", query,
        (function(response) {
          for ( var i = 0, key = response.keys[i]; key; i++) {
            var obj = this.storage_[key];
            delete this.storage_[key];
            sink && sink.remove && sink.remove(obj);
          }
        }).bind(this),
        sink && sink.error && sink.error.bind(sink));
    },
    // TODO: Implement removeAll()
    find: function(id, sink) {
      // No need to go to worker.
      this.storage_.find(id, sink);
    },
    select: function(sink, options) {
      sink = sink || [].sink;
      // Cases:
      // 1) Cloneable reducable sink. -- Clone sync, get response, reduceI
      // 2) Non-cloneable reducable sink -- treat same as case 3.
      // 3) Non-cloneable non-reducable sink -- Use key-creator, just put into sink

      var fc = this.createFlowControl_();

      if (sink.model_ && sink.reduceI) {
        var request = {
          sink: sink,
          options: options
        };

        this.makeRequest_(
          "select", request,
          (function(response) {
            var responsesink = JSONToObject.visit(response.sink);
            sink.reduceI(responsesink);
            sink.eof && sink.eof();
          }).bind(this),
          sink && sink.error && sink.error.bind(sink));
      } else {
        var mysink = this.KeyCollector.create();
        request = {
          sink: mysink,
          options: options
        };

        this.makeRequest_(
          "select", request,
          (function(response) {
            var responsesink = JSONToObject.visit(response.sink);
            for (var i = 0; i < responsesink.keys.length; i++) {
              var key = responsesink.keys[i];
              if ( fc.stopped ) break;
              if ( fc.errorEvt ) {
                sink.error && sink.error(fc.errorEvt);
                break;
              }
              var obj = this.storage_[key];
              sink.put(obj);
            }
            sink.eof && sink.eof();
          }).bind(this),
          sink && sink.error && sink.error.bind(sink));
      }
    },
    handleNotification_: function(message) {
      if (message.method == "put") {
        var obj = JSONToObject.visitObject(message.obj);
        this.storage_[obj.id] = obj;
        this.notify_("put", [obj]);
      } else if (message.method == "remove") {
        var obj = this.stroage_[message.key];
        delete this.storage_[message.key];
        this.notify_("remove", [obj]);
      }
    }
  },

  listeners: [
    {
      name: 'onMessage',
      help: 'Callback for message events from the delegate.',
      code: function(e) {
        // FIXME: Validate origin.
        var message = e.data;
        if (message.request) {
          var request = this.requests_[message.request];
          delete this.requests_[message.request];
          if (message.error) {
            request.error(message.error);
            return;
          }
          request.callback(message);
          return;
        } // If no request was specified this is a notification.
        this.handleNotification_(message);
      }
    }
  ]
});
