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
  name: 'CodeSnippet',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  requires: [ 'foam.flow.SourceCode' ],
  imports: [
    'codeSnippets'
  ],

  properties: [
    {
      name: 'id',
      defaultValue: 0,
    },
    {
      type: 'Int',
      name: 'ordering'
    },
    {
      type: 'String',
      name: 'name',
      lazyFactory: function() {
        if ( this.title ) return this.title.replace(/[^a-zA-Z0-9]/g, '_');
        return 'code_snippet_' + this.$UID;
      }
    },
    {
      type: 'String',
      name: 'title'
    },
    {
      name: 'src',
      // type: 'foam.flow.SourceCode',
      factory: function() {
        this.SourceCode.create({
          data: 'console.log("Hello world!");'
        });
      }
    },
    {
      type: 'String',
      name: 'ref',
      postSet: function(old, nu) {
        if ( old === nu || ! this.codeSnippets ) return;
        this.codeSnippets.where(EQ(this.model_.NAME, nu)).select({
          put: function(snippet) {
            if ( this.following_ )
              Events.unfollow(this.following_.src$, this.src$);
            // TODO(markdittmer): This is not actually binding updates all the
            // way down to the source text.
            // TODO(markdittmer): This should get unhooked during destruction.
            Events.follow(snippet.src$, this.src$);
            this.following_ = snippet;
          }.bind(this)
        });
      }
    },
    {
      name: 'following_',
      // type: 'foam.flow.CodeSnippet',
      defaultValue: null
    }
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.codeSnippets && this.codeSnippets.put && this.codeSnippets.put(this);
    }
  }
});
