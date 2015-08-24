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
      model_: 'FunctionProperty',
      name: 'exportApp',
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
      name: 'yes',
      label: 'Yes',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAJ1BMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfTHmrhGAAAADHRSTlMAKlT7gAWqUVj6UlNPDCTdAAAAO0lEQVQY02NgoBpgROYoOyDYTDZIHOUjJEiwpiNJcJxcgKTDxwpJB8vhTUhG+RgjGcVyBskOBhdqeRYAA6EM6OizgiUAAAAASUVORK5CYII=',
      ligature: 'done',
      code: function() {
        this.popup && this.popup.close();
        this.result_.set(true);
      },
    },
    {
      name: 'no',
      label: 'No',
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
        <heading>{{this.data.title}}</heading>
        <p>Your application requires the following permissions:</p>
        <pre><% this.prettyPermissions(out); %></pre>
        <p>Are you sure you want to export?</p>
        <actions>
          $$no{ model_: 'foam.ui.md.FlatButton' }
          $$yes{ model_: 'foam.ui.md.FlatButton' }
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
        max-width: 600px;
      }
      export-confirm heading {
        font-size: 150%;
        font-weight: bold;
      }
      export-confirm p {
        font-weight: bold;
      }
      export-confirm, export-confirm actions {
        display: flex;
        align-items: center;
      }
      export-confirm {
        flex-direction: column;
      }
      export-confirm heading, export-confirm p, export-confirm pre, export-confirm actions {
        margin: 6px;
      }
    */},
  ],
});
