/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'ModelGenerator',
  package: 'foam.ui.polymer.gen',

  requires: [
    'XHR',
    'foam.dao.EasyDAO',
    'foam.ui.DAOListView',
    'foam.ui.polymer.gen.PolymerPrototype',
    'foam.ui.polymer.gen.FunctionWrapper',
    'foam.ui.polymer.gen.DemoView',
    'foam.ui.polymer.gen.Link'
  ],

  constants: {
    BASE_MODEL: {
      package: 'foam.ui.polymer.gen',
      extends: 'foam.ui.polymer.gen.View',
      traits: [],
      properties: [
        'id',
        'children',
        'shortcuts',
        'className',
        'extraClassName',
        'showActions',
        'initializers_',
        'destructors_',
        'tooltip',
        'tooltipModel'
      ].map(function(propName) {
        return { name: propName, hidden: true };
      }),
      constants: { POLYMER_PROPERTIES: [] }
    }
  },

  properties: [
    {
      type: 'foam.ui.polymer.gen.FunctionWrapper',
      name: 'polymerFn',
      factory: function() {
        var fn = this.FunctionWrapper.create({
          name: 'Polymer'
        });
        fn.object[fn.name] = this.polymerFnImpl;
        return fn;
      },
      hidden: true
    },
    {
      type: 'Function',
      name: 'polymerFnImpl',
      factory: function() {
        return function(name, proto) {
          // Follow polymer's name+proto parameter matching.
          if (typeof name !== 'string') {
            var script = proto || document._currentScript;
            proto = name;
            name = (script &&
                script.parentNode &&
                script.parentNode.getAttribute) ?
                script.parentNode.getAttribute('name') : '';
          }
          // Store name+proto in polymers queue for processing by
          // ModelGenerator.
          this.polymers.put(this.PolymerPrototype.create({
            tagName: name,
            proto: proto
          }));
        }.bind(this);
      },
      hidden: true
    },
    {
      type: 'StringArray',
      name: 'linksToLoad',
      factory: function() {
        return [
          '../bower_components/paper-button/paper-button.html',
          '../bower_components/paper-checkbox/paper-checkbox.html'
        ];
      },
      view: 'foam.ui.TextAreaView'
    },
    {
      name: 'polymers',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.ui.polymer.gen.PolymerPrototype'
        });
      },
      hidden: true
    },
    {
      type: 'Array',
      name: 'components',
      factory: function() { return []; },
      hidden: true
    },
    {
      name: 'componentsJSON',
      view: 'foam.ui.TextAreaView',
      defaultValue: ''
    },
    {
      type: 'HTMLParser',
      todo: function() {/*
                         (markdittmer): HTMLParser isn't a proper model. It should be upgraded.
                         */},
      name: 'parser',
      factory: function() { return HTMLParser.create(); },
      hidden: true
    },
    {
      name: 'links',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'foam.ui.polymer.gen.Link'
        });
      },
      hidden: true
    },
    {
      name: 'urls',
      factory: function() { return {}; },
      hidden: true
    },
    {
      name: 'sources',
      factory: function() { return {}; },
      hidden: true
    },
    {
      name: 'xhrCount',
      defaultValue: 0
    },
    {
      name: 'defaultValueTypes',
      factory: function() {
        return {
          'boolean': true,
          number: true,
          string: true
        };
      },
      hidden: true
    },
    {
      name: 'nonPolymerProperties',
      factory: function() {
        return [
          'tagName'
        ];
      },
      hidden: true
    },
    {
      type: 'Boolean',
      name: 'demosRendered',
      defaultValue: false,
      hidden: true
    },
    {
      type: 'StringArray',
      name: 'demoNameWhitelist',
      factory: function() {
        return [
          'paper'
        ];
      },
      hidden: true
    },
    {
      type: 'StringArray',
      name: 'demoNameBlacklist',
      factory: function() {
        return [
          'base',
          'demo',
          'test'
        ];
      },
      hidden: true
    },
    {
      type: 'Int',
      name: 'modelsLoadingCount',
      defaultValue: 0
    },
    {
      name: 'models',
      view: {
        model_: 'foam.ui.DAOListView',
        rowView: 'foam.ui.polymer.gen.DemoView'
      },
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: 'Model'
        });
      }
    },
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();

        this.polymers.pipe({
          put: this.storeComponentFromProto.bind(this)
        });

        this.links.pipe({
          put: this.loadLink.bind(this)
        });

        this.putLinks(
            document.head.innerHTML +
                document.body.innerHTML);
        // TODO: Just for debugging.
        window.polyFoamComponents = this.components;
      }
    },
    {
      name: 'canonicalizeURL',
      code: function(url) {
        var parts = url.split('/').filter(function(part) {
          return part !== '.';
        });
        for ( var i = 1; i < parts.length; ++i ) {
          if ( i > 0 && parts[i] === '..' && parts[i - 1] !== '..' ) {
            parts = parts.slice(0, i - 1).concat(parts.slice(i + 1));
            i = i - 2;
          }
        }
        return parts.join('/');
      }
    },
    {
      name: 'getComponent',
      code: function(compName) {
        return this.components.filter(function(comp) {
          return comp.name === compName;
        })[0];
      }
    },
    {
      name: 'getOrCreateComponent',
      code: function(compName) {
        var comp = this.getComponent(compName);
        if ( ! compName ) debugger;
        if ( ! comp ) {
          comp = JSON.parse(JSON.stringify(this.BASE_MODEL));
          comp.name = compName;
          this.putComponent(comp);
        }
        return comp;
      }
    },
    {
      name: 'putComponent',
      code: function(comp) {
        if ( ! comp.name || this.getComponent(comp.name) ) debugger;
        this.components.push(comp);
        this.components.sort(function(c1, c2) { return c1.name > c2.name; });
        this.componentsJSON = JSON.stringify(this.components);
      }
    },
    {
      name: 'putLinks',
      code: function(src, opt_dir) {
        var dir = opt_dir || '';
        this.filterNodes(
            this.parser.parseString(src),
            this.importLinkFilter.bind(this))
                .map(this.extractHrefFromNode.bind(this))
                .forEach(function(href) {
                  var path = href.charAt(0) === '/' ? href : dir + href;
                  this.links.put(this.Link.create({ href: path }));
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
    },
    {
      name: 'loadLink',
      code: function(link) {
        var url = this.canonicalizeURL(link.href);
        if ( this.urls[url] ) return;
        this.urls[url] = true;

        var xhr = this.XHR.create();
        var dir = url.slice(0, url.lastIndexOf('/') + 1);
        var X = {
          self: this,
          dir: dir
        };
        ++this.xhrCount;
        xhr.asend(function(textContent) {
          var hashCode = '' + textContent.hashCode();
          if ( ! this.self.sources[hashCode] ) {
            this.self.sources[hashCode] = true;
            this.self.putLinks(textContent, this.dir);
            this.self.putComponents(textContent);
          }
          --this.self.xhrCount;
        }.bind(X), url);
      }
    },
    {
      name: 'putComponents',
      code: function(src) {
        this.filterNodes(this.parser.parseString(src), function(node) {
          return node.nodeName === 'polymer-element';
        })
            .map(this.componentHashFromNode.bind(this))
            .forEach(this.storeComponentFromHash.bind(this));
      }
    },
    {
      name: 'componentHashFromNode',
      code: function(node) {
        // Use __metadata__ in hash to allow for non-meta-level properties
        // named 'name' or 'extends'.
        var compHash = {__metadata__: {} };
        var attrs = node.attributes;
        for ( var i = 0; i < attrs.length; ++i ) {
          if ( attrs[i].name === 'name' ) {
            compHash.tagName = attrs[i].value;
            compHash.__metadata__['name'] =
                this.getComponentName(compHash.tagName);
          } else if ( attrs[i].name === 'extends' ) {
            compHash.__metadata__['extends'] =
                this.getComponentName(attrs[i].value);
          } else if ( attrs[i].name === 'attributes' ) {
            var attrNames = attrs[i].value
                .replace(/\s+/g, ' ')
                .trim()
                .split(' ');
            attrNames.forEach(function(attrName) {
              compHash[attrName] = undefined;
            });
          }
        }
        return compHash;
      }
    },
    {
      name: 'storeComponentFromHash',
      code: function(compHash) {
        var name = compHash.__metadata__['name'];
        var ext  = compHash.__metadata__['extends'];
        var comp = this.getOrCreateComponent(name);
        Object.getOwnPropertyNames(compHash).forEach(function(key) {
          if ( key !== '__metadata__' ) {
            this.updateProperty(comp, key, compHash[key]);
          }
        }.bind(this));
        if ( ext ) {
          comp.traits.push(
              'foam.ui.polymer.gen.' + ext);
        }
      }
    },
    {
      name: 'getComponentName',
      code: function(tagName) {
        var name = tagName.charAt(0).toUpperCase() + tagName.slice(1);
        while ( name.indexOf('-') >= 0 ) {
          name = name.slice(0, name.indexOf('-')) +
              name.charAt(name.indexOf('-') + 1).toUpperCase() +
              name.slice(name.indexOf('-') + 2);
        }
        return name;
      }
    },
    {
      name: 'storeComponentFromProto',
      code: function(p) {
        var name = this.getComponentName(p.tagName);
        var comp = this.getOrCreateComponent(name);

        // Attributes either come from:
        //   HTML:  <polymer-element attributes="attr1 attr2">
        //   Proto: { attr1: ..., attr2: ... }
        // or:
        //   Proto: { publish: { attr1: ..., attr2: ... }, ... }

        // Default to proto.publish (or empty).
        var attrs = p.proto && p.proto.publish ? p.proto.publish : {};
        var protoNames = p.proto ? Object.getOwnPropertyNames(p.proto) : [];
        var protoPublishNames = Object.getOwnPropertyNames(attrs);
        // Look up names that presumably came from <polymer-element ...>.
        var existingPropNames = comp.properties.map(function(prop) {
          return prop.name;
        });
        // Props to add to default: ones from <polymer-element ...> that
        // appear in proto, but not in proto.publish.
        var extraPropNames = existingPropNames.filter(function(epn) {
          return protoNames.some(function(pn) { return pn === epn; }) &&
              ! protoPublishNames.some(function(ppn) { return ppn === epn; });
        });
        extraPropNames.forEach(function(epn) {
          attrs[epn] = p.proto[epn];
        });

        Object.getOwnPropertyNames(attrs).forEach(function(key) {
          this.updateProperty(comp, key, attrs[key]);
        }.bind(this));
      }
    },
    {
      name: 'updateProperty',
      code: function(modelHash, propName, opt_propValue) {
        try {
          if ( ! modelHash.properties ) modelHash.properties = [];
        } catch (e) { debugger; }
        var properties = modelHash.properties;
        var matchingProps = properties.filter(function(prop) {
          return prop.name === propName;
        });
        var prop;
        if ( matchingProps.length === 0 ) {
          prop = { name: propName };
          properties.push(prop);
        } else {
          prop = matchingProps[0];
        }
        var propValue = this.getPropertyValue(opt_propValue);
        var propModelName = this.getPropertyModel(propValue);
        if ( propModelName ) prop.model_ = propModelName;
        var typeOf = typeof propValue;
        if ( this.defaultValueTypes[typeOf] ) {
          prop.defaultValue = propValue;
        } else if ( propValue !== undefined ) {
          eval('prop.factory = function() { return ' +
              JSON.stringify(propValue) +
              '; }');
        }
        if ( ! prop.postSet ) {
          eval(
              'prop.postSet = function() { this.postSet(\'PROPNAME\'); }'
                  .replace('PROPNAME', prop.name));
        }

        // Some properties that get 'updated' are not Polymer properties.
        if ( ! this.nonPolymerProperties.some(function(propName) {
          return prop.name === propName;
        }) ) {
          var polyProps = modelHash.constants.POLYMER_PROPERTIES;
          if ( ! polyProps.some(function(propName) {
            return propName === prop.name;
          }) ) {
            polyProps.push(prop.name);
          }
        }
      }
    },
    {
      name: 'getPropertyModel',
      code: function(value) {
        if (value === undefined) return '';

        var typeOf = typeof value;
        if ( typeOf === 'boolean' ) {
          return 'BooleanProperty';
        } else if ( typeOf === 'number' ) {
          if ( Number.isInteger(value) ) {
            return 'IntProperty';
          } else {
            return 'FloatProperty';
          }
        } else if ( typeOf === 'string' ) {
          return 'StringProperty';
        } else if ( Array.isArray(value) ) {
          return 'ArrayProperty';
        } else {
          return '';
        }
      }
    },
    {
      name: 'getPropertyValue',
      code: function(value) {
        if ( value !== null && typeof value === 'object' &&
            Object.getOwnPropertyNames(value).some(function(name) {
              return name === 'value';
            }) ) { return value.value; }
        else       return value;
      }
    },
    {
      name: 'componentFilter',
      code: function(comp) {
        return this.demoNameWhitelist.some(function(wlName) {
          return comp.name.indexOfIC(wlName) >= 0;
        }) && ! this.demoNameBlacklist.some(function(blName) {
          return comp.name.indexOfIC(blName) >= 0;
        }) && comp.POLYMER_PROPERTIES.length > 0;
      }
    }
  ],

  actions: [
    {
      name: 'loadLinks',
      code: function() {
        var linksHTML = '';
        this.linksToLoad.forEach(function(linkToLoad) {
          var link = document.createElement('link');
          link.setAttribute('rel', 'import');
          link.setAttribute('href', linkToLoad);
          document.head.appendChild(link);
          linksHTML += link.outerHTML;
        }.bind(this));
        this.putLinks(linksHTML);
      }
    },
    {
      name: 'importModels',
      isEnabled: function() {
        this.xhrCount;
        return this.xhrCount <= 0;
      },
      code: function() {
        this.components.forEach(function(comp) {
          try {
            CLASS(comp);
            ++this.modelsLoadingCount;
          } catch (e) { debugger; }
        }.bind(this));
        this.components.forEach(function(comp) {
          try {
            this.X.arequire(comp.package + '.' + comp.name)(
                function(model) {
                  if ( this.componentFilter(model) ) {
                    this.models.put(model);
                  }
                  --this.modelsLoadingCount;
                  if ( this.modelsLoadingCount <= 0 ) {
                    this.modelsLoadingCount = 0;
                    this.linksToLoad = [];
                  }
                }.bind(this));
          } catch (e) { debugger; }
        }.bind(this));
      }
    }
  ]
});
