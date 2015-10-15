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
  package: 'foam.apps.builder.dao',
  name: 'GoogleDriveDAOFactoryEditView',
  extends: 'foam.apps.builder.dao.EditView',

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <p>
          Create an app on the <a href="https://console.developers.google.com/" target="_blank">Google Developers Console</a> and copy the authentication details here.
        </p>
        $$authClientId
        $$authClientSecret
      </div>
    */},
    function CSS() {/*

    */},
  ],

});
