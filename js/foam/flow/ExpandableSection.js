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
  name: 'ExpandableSection',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  requires: [
    'foam.ui.md.SectionView',
    'foam.ui.md.ExpandableView'
  ],

  properties: [
    {
      type: 'String',
      name: 'heading'
    },
    {
      type: 'String',
      name: 'content'
    },
    {
      type: 'Boolean',
      name: 'expanded',
      defaultValue: false
    },
    {
      name: 'view',
      lazyFactory: function() {
        return this.SectionView.create({
          title$: this.heading$,
          expanded$: this.expanded$,
          delegate: this.ExpandableView.xbind({
            delegate: function() { return this.content; }.bind(this)
          })
        });
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* %%view */},
    function CSS() {/* expandable-section { display: block; } */}
  ]
});
