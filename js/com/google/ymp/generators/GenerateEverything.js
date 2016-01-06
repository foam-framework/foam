/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.ymp.generators',
  name: 'GenerateEverything',

  requires: [
    'com.google.ymp.generators.ContactProfileGenerator',
    'com.google.ymp.generators.DynamicImageGenerator',
    'com.google.ymp.generators.MarketGenerator',
    'com.google.ymp.generators.PersonGenerator',
    'com.google.ymp.generators.PostGenerator',
    'com.google.ymp.generators.ProductNameGenerator',
    'com.google.ymp.test.DataLoader',
  ],
  imports: [
    'contactProfileDAO_',
    'dynamicImageDAO_',
    'marketDAO_',
    'personDAO_',
    'postDAO_',
  ],

  properties: [
    { type: 'Int', name: 'numMarkets', defaultValue: 0 },
    { type: 'Int', name: 'numPeople', defaultValue: 0 },
    { type: 'Int', name: 'numContactProfiles', defaultValue: 0 },
    { type: 'Int', name: 'numDynamicImages', defaultValue: 0 },
    { type: 'Int', name: 'numPosts', defaultValue: 0 },
    { type: 'Boolean', name: 'clearMarkets', defaultValue: false },
    { type: 'Boolean', name: 'clearPeople', defaultValue: false },
    { type: 'Boolean', name: 'clearContactProfiles', defaultValue: false },
    { type: 'Boolean', name: 'clearDynamicImages', defaultValue: false },
    { type: 'Boolean', name: 'clearPosts', defaultValue: false },
    {
      type: 'StringArray',
      name: 'itemNames',
      lazyFactory: function() {
        return [
          { camelPlural: 'Markets', camelSingle: 'Market', baseName: 'market', dao: 'marketDAO_' },
          { camelPlural: 'People', camelSingle: 'Person', baseName: 'person', dao: 'personDAO_' },
          { camelPlural: 'ContactProfiles', camelSingle: 'ContactProfile', baseName: 'contactProfile', dao: 'contactProfileDAO_' },
          { camelPlural: 'DynamicImages', camelSingle: 'DynamicImage', baseName: 'dynamicImage', dao: 'dynamicImageDAO_' },
          { camelPlural: 'Posts', camelSingle: 'Post', baseName: 'post', dao: 'postDAO_' },
        ];
      },
    },
    {
      subType: 'com.google.ymp.test.DataLoader',
      name: 'dataLoader',
      documentation: 'Data loader used to load from/save to JSON file',
      lazyFactory: function() { return this.DataLoader.create(); },
    },
    {
      type: 'StringArray',
      name: 'productNames',
      lazyFactory: function() {
        // Use the generate() interface to "get all product names".
        var pnGenerator = this.ProductNameGenerator.create();
        var productNames = [];
        var pnFn = function(productName) {
          if ( ! productName ) return;
          productNames.push(productName);
          pnGenerator.generate(pnFn);
        };
        pnGenerator.generate(pnFn);
        return productNames;
      },
    },
    {
      type: 'Boolean',
      name: 'sideLoadedDynamicImages',
      documentation: function() {/* Generating posts sometimes causes us to
        side-load duplicate image data. This flag is used to indicate that
        (even if no new images were requested) image data should be  written
        back. */},
      defaultValue: false,
    },
  ],

  methods: [
    function execute() {
      this.clearData_();
      aseq(
          this.generateMarkets,
          this.generatePeople,
          this.generateContactProfiles,
          this.generateDynamicImages,
          this.generatePosts,
          this.saveData)(function() {
            console.log('CONTENT GENERATION COMPLETE');
          });
    },

    function generateContent_(ret, itemName, opt_genArgGenerator) {
      var dao = this[itemName.dao];
      var g = this[itemName.camelSingle + 'Generator'].create();
      if ( ! this['num' + itemName.camelPlural] ) {
        ret(g);
        return;
      }
      // Some generate functions are passed an extra argument. In this case,
      // use opt_genArgGenerator to generate the argument value.
      var f = opt_genArgGenerator ?
          function(ret) {
            g.generate(function(m) {
              dao.put(m, {
                put: function(m) {
                  ret(g);
                },
              });
            }, opt_genArgGenerator());
          } :
          function(ret) {
            g.generate(function(m) {
              dao.put(m, {
                put: function(m) {
                  ret(g);
                },
              });
            });
          };
      var num = this['num' + itemName.camelPlural];
      console.log('this.' + 'num' + itemName.camelPlural, num);
      var par = new Array(num);
      for ( var i = 0; i < num; ++i ) {
        par[i] = f;
      }
      apar.apply(null, par)(function() { ret(g); });
    },

    function clearData_() {
      for ( var i = 0; i < this.itemNames.length; ++i ) {
        var name = this.itemNames[i].camelPlural;
        var dao = this.itemNames[i].dao;
        if ( this['clear' + name] ) {
          this[dao].removeAll();
        }
      }
    },
  ],

  listeners: [
    function generateMarkets(ret) {
      this.generateContent_(
          ret,
          this.itemNames.filter(function(n) {
            return n.baseName === 'market';
          })[0]);
    },
    function generatePeople(ret) {
      this.generateContent_(
          ret,
          this.itemNames.filter(function(n) {
            return n.baseName === 'person';
          })[0]);
    },
    function generateContactProfiles(ret) {
      this.generateContent_(
          ret,
          this.itemNames.filter(function(n) {
            return n.baseName === 'contactProfile';
          })[0]);
    },
    function generateDynamicImages(ret) {
      // TODO(markdittmer): Implement this.
      var dao = this.dynamicImageDAO_;
      ret(dao);
    },
    function generatePosts(ret) {
      this.generateContent_(
          function(g) {
            this.sideLoadedDynamicImages_ = g.sideLoadedDynamicImages_;
            ret(g);
          }.bind(this),
          this.itemNames.filter(function(n) {
            return n.baseName === 'post';
          })[0],
          this.randomProductName);
    },
    function saveData(ret) {
      var self = this;
      var dataLoader = self.dataLoader;
      var par = [];
      self.itemNames.forEach(function(itemName) {
        var name = itemName.camelPlural;
        var baseName = itemName.baseName;
        var dao = itemName.dao;
        if ( self['num' + name] ||
            // Special case: Side-loaded dynamic images.
            (name === 'DynamicImages' && self.sideLoadedDynamicImages_) ) {
          par.push(function(ret) {
            var arr = [];
            self[dao].select(arr)(function() {
              var strData = JSONUtil.stringify(arr);
              dataLoader.saveData(baseName, strData);
              console.log(name, 'saved');
              ret(self[dao]);
            });
          });
        }
      });
      apar.apply(null, par)(ret);
    },
    function randomProductName() {
      var arr = this.productNames;
      return arr[Math.floor(Math.random() * arr.length)];;
    },
  ],
});
