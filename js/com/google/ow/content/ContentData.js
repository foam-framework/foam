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

__DATA({
  model_: 'com.google.ow.DAOData',
  id: 'com.google.ow.content.ContentData',

  dao: [
    {
      model_: 'com.google.ow.content.ContentIndex',
      titleText: 'Video List',
      description: 'A list of video items.',
      model: 'com.google.ow.content.Video',
      contentItemView: 'foam.ui.md.CitationView',
    },
  ].dao,
});
