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
  name: 'ComponentDependencyBuilder',
  package: 'foam.ui.polymer.gen',
  extendsModel: 'foam.ui.polymer.gen.ComponentBuilderBase',

  imports: [
    'canonicalizeURL',
    'controller'
  ],

  properties: [
    {
      model_: 'StringArrayProperty',
      name: 'provides',
      factory: function() {
        return ['deps'];
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'listensTo',
      factory: function() {
        return ['source'];
      }
    },
    {
      model_: 'StringProperty',
      name: 'dir'
    },
    {
      type: 'HTMLParser',
      name: 'parser',
      factory: function() { return HTMLParser.create(); },
      hidden: true
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.dir = this.dirFromURL(this.comp.url);
        Events.map(this.comp.url$, this.dir$, this.dirFromURL);

        var ret = this.SUPER();
        this.run();
        return ret;
      }
    },
    {
      name: 'dirFromURL',
      code: function(url) {
        return url.slice(0, url.lastIndexOf('/') + 1);
      }
    },
    {
      name: 'run',
      code: function() {
        var src = this.comp.source;
        var dir = this.dir;
        if ( dir === '' ) debugger;
        this.filterNodes(
            this.parser.parseString(src),
            this.importLinkFilter.bind(this))
                .map(this.extractHrefFromNode.bind(this))
                .forEach(function(href) {
                  var path = href.charAt(0) === '/' ? href : dir + href;
                  var url = this.canonicalizeURL(path);
                  if ( ! this.comp.deps.some(function(dep) {
                    return dep === url;
                  }) ) {
                    this.comp.deps.push(url);
                    this.controller.registerComponent(path);
                  }
                }.bind(this));
      }
    },
    {
      name: 'filterNodes',
      code: function(node, fltr, opt_acc) {
        var acc = opt_acc || [];
        if ( fltr(node) ) acc.push(node);
        node.children.forEach(function(child) {
          this.filterNodes(child, fltr, acc);
        }.bind(this));
        return acc;
      }
    },
    {
      name: 'importLinkFilter',
      code: function(node) {
        if ( node.nodeName !== 'link') return false;
        var attrs = node.attributes, rel = false, href = false;
        for ( var i = 0; i < attrs.length; ++i ) {
          if ( attrs[i].name === 'rel' && attrs[i].value === 'import' ) {
            rel = true;
          }
          if ( attrs[i].name === 'href' ) {
            href = true;
          }
        }
        return rel && href;
      }
    },
    {
      name: 'extractHrefFromNode',
      code: function(node) {
        var attrs = node.attributes, rel = false, href = false;
        for ( var i = 0; i < attrs.length; ++i ) {
          if ( attrs[i].name === 'href' ) {
            return attrs[i].value;
          }
        }
        return '';
      }
    }
  ],

  actions: [
    {
      name: 'go',
      action: function() {
      }
    }
  ],

  listeners: [
    {
      name: 'onSomething',
      code: function() {
        return this;
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <{{{this.tagName}}} id="{{{this.id}}}">
        <% this.children.forEach(function(child) { %>
          {{{child.toHTML()}}}
        <% }); %>
      </{{{this.tagName}}}>
    */}
  ]
});
