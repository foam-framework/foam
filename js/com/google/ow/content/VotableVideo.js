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
  package: 'com.google.ow.content',
  name: 'VotableVideo',
  extends: 'com.google.ow.content.Video',
  traits: [
    'com.google.ow.content.VotableTrait',
    'com.google.ow.content.CommentThreadTrait',
  ],

  methods: [
    function toDetailE(X) {
      return this.SUPER(X).add(this.toVoteE(X)).add(this.toCommentsE(X));
    },
    function toCitationE(X) {
      return this.SUPER(X);
    },
  ],
});
