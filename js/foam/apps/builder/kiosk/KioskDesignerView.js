/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.kiosk',
  name: 'KioskDesignerView',
  extendsModel: 'foam.apps.builder.DesignerView',

  requires: [
    'foam.apps.builder.kiosk.KioskView',
  ],

  exports: [
    'url$',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unfollow(old.homepage$, this.url$);
        if ( nu ) Events.follow(nu.homepage$, this.url$);
      },
    },
    {
      model_: 'StringProperty',
      name: 'url',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'appView',
      defaultValue: 'foam.apps.builder.kiosk.KioskView',
    },
  ],
});
