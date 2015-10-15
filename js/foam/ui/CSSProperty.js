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
  package: 'foam.ui',
  name: 'CSSProperty',
  extends: 'Property',

  requires: [
    'foam.ui.CSSTransition',
  ],

  properties: [
    {
      name: 'adapt',
      defaultValue: function(old, nu, prop) {
        var CSSTransition = prop.CSSTransition;
        if ( typeof nu === 'string' ) {
          return (old || CSSTransition.create()).fromString(prop.name + ' ' + nu);
        } else if ( CSSTransition.isInstance(nu) ) {
          return nu;
        } else {
          return null;
        }
      },
    },
    {
      name: 'postSet',
      defaultValue: function(old, nu, prop) {
        if ( old === nu ) return;

        // When a transition changes, invalidate cssString_.
        if ( this.cssString_ ) this.cssString_ = null;

        // Update cssProperties_ map.
        if ( ! this.cssProperties_ ) return;
        if ( nu ) this.cssProperties_[prop.name] = nu;
        if ( ( ! nu ) && old ) delete this.cssProperties_[prop.name];
      },
    },
  ],
});
