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
  package: 'foam.tutorials.phonecat.crawlable',
  name: 'PhoneCrawlableController',
  extends: 'foam.tutorials.phonecat.crawlable.CrawlableController',
  requires: [
    'foam.tutorials.phonecat.dao.PhoneDAO',
    'foam.tutorials.phonecat.model.Phone'
  ],
  properties: [
    { name: 'dao', factory: function() { return this.PhoneDAO.create(); } },
    { name: 'applicationURL',   defaultValue: 'http://localhost:8000/index.html?model=foam.tutorials.phonecat.crawlable.PhoneCrawlableController' },
    { name: 'applicationIdURL',   defaultValue: 'http://localhost:8000/index.html?model=foam.tutorials.phonecat.crawlable.PhoneCrawlableController#' },
  ]
});
