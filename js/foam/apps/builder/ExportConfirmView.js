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
  package: 'foam.apps.builder',
  name: 'ExportConfirmView',
  extendsModel: 'foam.ui.SimpleView',

  imports: [
    'popup',
  ],

  properties: [
    {
      type: 'foam.apps.builder.AppConfig',
      name: 'data',
    },
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'App Export',
    },
    {
      model_: 'StringProperty',
      name: 'actionName',
      defaultValue: 'exportApp',
    },
    {
      name: 'result',
      lazyFactory: function() {
        return this.result_.get;
      },
    },
    {
      name: 'result_',
      lazyFactory: function() {
        return afuture();
      },
    },
  ],

  actions: [
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'confirm',
      label: 'Confirm',
      trackingNameFn: function(X, self) {
        return this.name + ':' + self.actionName;
      },
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAJ1BMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfTHmrhGAAAADHRSTlMAKlT7gAWqUVj6UlNPDCTdAAAAO0lEQVQY02NgoBpgROYoOyDYTDZIHOUjJEiwpiNJcJxcgKTDxwpJB8vhTUhG+RgjGcVyBskOBhdqeRYAA6EM6OizgiUAAAAASUVORK5CYII=',
      ligature: 'done',
      code: function() {
        this.popup && this.popup.close();
        this.result_.set(true);
      },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'cancel',
      label: 'Cancel',
      trackingNameFn: function(X, self) {
        return this.name + ':' + self.actionName;
      },
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAdklEQVQ4y+WTuQ3AIBAEaQKK8NN/BEUArmccgGyj43MMIZo5TqtFqbUPJxYtbg2OvS44IJQKhguwdUETSiXjXr77KhGICRjihWKm8Dw3KXP4Z5VZ/Lfw7B5kyD1cy5C7uAx5iJcht6vhRTUi4OrC0Szftvi/vAFNdbZ2Dp661QAAAABJRU5ErkJggg==',
      ligature: 'close',
      code: function() {
        this.popup && this.popup.close();
        this.result_.set(false);
      },
    }
  ],

  templates: [
    function toHTML() {/*
      <export-confirm id="%%id">
        <div class="md-card-heading">
          <span class="md-headline">{{this.title}}</span>
        </div>
        <div class="md-card-heading-content-spacer"></div>
        <div class="md-card-content">
          <span class="md-subhead md-grey">Your application requires the following permissions:</span>
          <pre class="md-quote md-grey" style="margin-left: 16px"><% this.prettyPermissions(out); %></pre>
        </div>
        <div class="md-card-content-footer-spacer"></div>
        <actions class="md-actions md-card-footer horizontal">
          $$cancel{ model_: 'foam.ui.md.FlatButton', displayMode: 'LABEL_ONLY' }
          $$confirm{ model_: 'foam.ui.md.FlatButton', displayMode: 'LABEL_ONLY' }
        </actions>
      </export-confirm>
    */},
    function prettyPermissions() {/*<%
      var permissions = this.data ? this.data.getChromePermissions() : '';
      if ( permissions ) {
        for ( var i = 0; i < permissions.length; ++i ) {
          if ( typeof permissions[i] === 'string' ) {
            %><%= permissions[i] %>
<%          continue;
          } %>[
<%        for ( var key in permissions[i] ) {
            if ( permissions[i].hasOwnProperty(key) ) {
              %>  <%= key %>: <%= permissions[i][key] %>,
<%          }
          } %>]
<%      }
      } else { %>No permissions<% } %>*/},
    function CSS() {/*
      export-confirm {
        display: block;
      }
      export-confirm pre {
        margin: 0;
      }
      @media (min-width: 600px) {
        export-confirm {
          min-width: 570px;
        }
      }
    */},
  ],
});
