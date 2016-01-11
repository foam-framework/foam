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
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.apps.builder.InfoOptionView',
    'foam.ui.Icon',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.FlatButton',
  ],
  imports: [
    'popup',
    'appBuilderAnalyticsEnabled$ as appBuilderAnalyticsInitialValue_$',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old ) {
          old.appBuilderAnalyticsEnabled$.removeListener(this.onABAnalyticsChange);
          old.analyticsId$.removeListener(this.onAnalyticsIdChange);
          old.userDataWarning$.removeListener(this.onUserDataWarningChange);
        }
        if ( nu ) {
          nu.appBuilderAnalyticsEnabled = this.appBuilderAnalyticsInitialValue_;
          nu.appBuilderAnalyticsEnabled$.addListener(this.onABAnalyticsChange);
          nu.analyticsId$.addListener(this.onAnalyticsIdChange);
          nu.userDataWarning$.addListener(this.onUserDataWarningChange);
        }
      },
    },
    {
      type: 'String',
      name: 'title',
      defaultValue: 'App Export',
    },
    {
      type: 'String',
      name: 'actionName',
      defaultValue: 'exportApp',
    },
    {
      type: 'Boolean',
      name: 'mayPublishToCWS',
      label: 'This app will be deployed to the Chrome Web Store',
      defaultValue: true,
    },
    {
      type: 'ViewFactory',
      name: 'infoIcon',
      defaultValue: {
            factory_: 'foam.ui.Icon',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAzElEQVR4Ad3VQQqDMBCF4eBC79UjCIqieJvuWxB6B0WPpATtDbrRzfQtspwk2gwIFb6VkB8CM1H//d3unwQaGEHDbmgYoIYElI31BxTwBvJYIT8TiOAFdFILkTfgPNyv9QUKoECZLZAcuHNlkMMCMRdogEIDRsUFRiAhPRfQgoGZC+yCV7RdEtCCgYkLDIKBjgvUgoHSNmirQECzg2bkQIFS37JrAw5/Hl3Xv0QejnXNymAB8tCQuh4clxgq6GGGzZiggxJiUK6AgAsDXy/xrnGhwEbNAAAAAElFTkSuQmCC',
            ligature: 'info',
            color: '#02A8F3',
      },
    },
    {
      type: 'ViewFactory',
      name: 'warningIcon',
      defaultValue: {
        factory_: 'foam.ui.Icon',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA1ElEQVR4AeXQMQ4BURDG8c0miq22oqOkpqZRugAH4AIcgEbJAbgAB+AA1NSUdFQK2WKTzfiKN8lmY+17b0fDJL/k6/7JOP917emzozi6eOgowBlOaosHRkDKUDpQggcH1C5KBpZACQupQAMioIQI6hKBPVCKXd5ADyhD1zbgwRUoxlEo5gKeTWAClBFgY9NABQKDQABlk8AaSDPAVrqBFpClZlbAhWOOwAHcT4EBEDN8EeunBXy4CwRu4L8LzIGEzJKBGoSCgRCq8cAWSNiGA1/zG4EXqVpDJA/KbhEAAAAASUVORK5CYII=',
        ligature: 'warning',
        color: '#02A8F3',
      },
    },
    {
      type: 'ViewFactory',
      name: 'permissions',
      defaultValue: function() {
        var permissionsText = this.prettyPermissionsHTML();
        return this.InfoOptionView.create({
          icon: this.infoIcon,
          title: 'Your app permissions',
          details: function() {
            return '<pre class="md-quote info-content">' +
                permissionsText + '</pre>';;
          },
        });
      },
    },
    'permissionsView',
    {
      type: 'ViewFactory',
      name: 'analyticsThanks',
      defaultValue: function() {
        return this.InfoOptionView.create({
          icon: {
            factory_: 'foam.ui.Icon',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAA21BMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfQ7S5iSAAAASHRSTlMACF6u4vrgrFsGWebjVQKYzmclJmjQlPZjAfc9Pwflj/mMaqvhiSjfKd6tBN3ZA2yqXD74OdLk3No6a1ZGd3ZFQVKVkZBRWAVSrJoRAAAA8UlEQVR4Xp3NyVLCUBSE4RaMJBEDgQS4V6IBI4MoIJFBwAmnfv8nsurmlJiNC75NL/6qc3Cwo0Lx2LJOSraDHPeUonyGPa9CVv2a49SDkGx4EKiw2UJG+ZoNCJfNc/xqa8q16IIt/BGw7JhQYBW4jDtANiqkbUKRPhBTAzJdXpmQsAZ09DUg02PfBIsOciLG/4eEdeQMODR7wwCjW4q7MSacmnDPUGGW0tAPUHO62ckFfWC2JMnVI7BmIk831G1gtH16fhkDrynfIHbUvoKh1infIeDtyLDbi6LBZE5+eNjbLCiST+REdqkfp8Pp1zcO9QMEiid4s9ErPwAAAABJRU5ErkJggg==',
            ligature: 'mood',
            color: '#02A8F3',
          },
          title: 'Thanks for supporting App Builder!',
          details: function() {
            return multiline(function() {/*
              <div class="md-body">
                By sending analytics data to the App Builder team you help us
                better understand how the world is benefiting App Builder. This
                helps us focus on the features that you need most.<br>
                <a href="#">Learn more</a>
              </div>
            */});
          },
        });
      },
    },
    'analyticsThanksView',
    {
      type: 'ViewFactory',
      name: 'analyticsNoThanks',
      defaultValue: function() {
        return this.InfoOptionView.create({
          icon: {
            factory_: 'foam.ui.Icon',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAA1VBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRwChdmAAAARnRSTlMACF6u4vrgrFsGWebjVQKYzmclJmjQlPZjAfc9Pwflj/mMaqvhiSjfKd6tZMn4yGJsqly4s9Lkk2tWRH2AfEVSlZGQUVgFNJYT/gAAAO1JREFUeF6dzVlPwkAYheEDWGkrTim0wAyOFqwsahVUNlfczv//SSaTL2JvvOC5OZO8yTfYW6VaO/C8w7ofoCQ8omgcY0dFZDNuBUE7ScmOgkDEbk+eOjbsQITs9vHrxFCu2VP28EfCRuBClU3gLBsAbqBT+i7UGAMZDSAz5LkLOVvAwFwAMiOOXfAYoMQy+z/kbKNkwqnbSyYA1NV1UdzcagAzzl24Y6pRuafzYKEXDF2wS8aIKFZYM5dPNzSPT8/i5bXgG8SWJtZw9LrgOwTUlkyHI2snswX5obCzWVLknyixfn2cFdP51zf29QO70CaRHQ47yAAAAABJRU5ErkJggg==',
            ligature: 'mood_bad',
            color: '#02A8F3',
          },
          title: "The App Builder team can't support apps we don't know about!",
          details: function() {
            return multiline(function() {/*
              <div class="md-body">
                When you opt-out of sending analytics data to the App Builder
                team, it makes your app invisible to us. Rest assured, our
                analytics data collection contains no personal information about
                you or your users. Just things like how many people use your app
                and how often.<br>
                <a href="#">Learn more</a>
              </div>
            */});
          },
        });
      },
    },
    'analyticsNoThanksView',
    {
      type: 'ViewFactory',
      name: 'ownAnalytics',
      defaultValue: function() {
        return this.InfoOptionView.create({
          icon: {
            factory_: 'foam.ui.Icon',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA1ElEQVR4AeXQMQ4BURDG8c0miq22oqOkpqZRugAH4AIcgEbJAbgAB+AA1NSUdFQK2WKTzfiKN8lmY+17b0fDJL/k6/7JOP917emzozi6eOgowBlOaosHRkDKUDpQggcH1C5KBpZACQupQAMioIQI6hKBPVCKXd5ADyhD1zbgwRUoxlEo5gKeTWAClBFgY9NABQKDQABlk8AaSDPAVrqBFpClZlbAhWOOwAHcT4EBEDN8EeunBXy4CwRu4L8LzIGEzJKBGoSCgRCq8cAWSNiGA1/zG4EXqVpDJA/KbhEAAAAASUVORK5CYII=',
            ligature: 'warning',
            color: '#02A8F3',
          },
          title: 'Your analytics data collection may require user consent',
          details: function() {
            return multiline(function() {/*
              <div class="md-body">
                This application is configured to use analytics data. If you
                intend to deploy it on the Chrome Web Store you <b>must</b>
                obtain consent from users to collect these data by linking to a
                Privacy Policy from your Chome Web Store app entry.<br>
                <a href="#">Learn more</a>
              </div>
            */});
          },
        });
      },
    },
    'ownAnalyticsView',
    {
      type: 'ViewFactory',
      name: 'abAnalytics',
      defaultValue: function() {
        return this.InfoOptionView.create({
          icon: {
            factory_: 'foam.ui.Icon',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA1ElEQVR4AeXQMQ4BURDG8c0miq22oqOkpqZRugAH4AIcgEbJAbgAB+AA1NSUdFQK2WKTzfiKN8lmY+17b0fDJL/k6/7JOP917emzozi6eOgowBlOaosHRkDKUDpQggcH1C5KBpZACQupQAMioIQI6hKBPVCKXd5ADyhD1zbgwRUoxlEo5gKeTWAClBFgY9NABQKDQABlk8AaSDPAVrqBFpClZlbAhWOOwAHcT4EBEDN8EeunBXy4CwRu4L8LzIGEzJKBGoSCgRCq8cAWSNiGA1/zG4EXqVpDJA/KbhEAAAAASUVORK5CYII=',
            ligature: 'warning',
            color: '#02A8F3',
          },
          title: 'App Builder analytics data collection may require user consent',
          details: function() {
            return multiline(function() {/*
              <div class="md-body">
                This application is configured to send analytics data to the App
                Builder team. If you intend to deploy it on the Chrome Web Store
                you <b>must</b> obtain consent from users to collect these data
                by linking to a Privacy Policy from your Chome Web Store app
                entry.<br>
                <a href="#">Learn more</a>
              </div>
            */});
          },
        });
      },
    },
    'abAnalyticsView',
    {
      type: 'ViewFactory',
      name: 'userDataWarning',
      defaultValue: function() {
        return this.InfoOptionView.create({
          icon: {
            factory_: 'foam.ui.Icon',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA1ElEQVR4AeXQMQ4BURDG8c0miq22oqOkpqZRugAH4AIcgEbJAbgAB+AA1NSUdFQK2WKTzfiKN8lmY+17b0fDJL/k6/7JOP917emzozi6eOgowBlOaosHRkDKUDpQggcH1C5KBpZACQupQAMioIQI6hKBPVCKXd5ADyhD1zbgwRUoxlEo5gKeTWAClBFgY9NABQKDQABlk8AaSDPAVrqBFpClZlbAhWOOwAHcT4EBEDN8EeunBXy4CwRu4L8LzIGEzJKBGoSCgRCq8cAWSNiGA1/zG4EXqVpDJA/KbhEAAAAASUVORK5CYII=',
            ligature: 'warning',
            color: '#02A8F3',
          },
          title: 'User data collection may require user consent',
          details: this.data.userDataWarning || function() { return ''; },
        });
      },
    },
    'userDataWarningView',
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
    {
      type: 'Boolean',
      name: 'appBuilderAnalyticsInitialValue_',
      defaultValue: true,
      postSet: function() {
        if ( this.data )
          this.data.appBuilderAnalyticsEnabled =
              this.appBuilderAnalyticsInitialValue_;
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.mayPublishToCWS$.addListener(this.onMayPublishChange);
    },
    // TODO(markdittmer): This should be pushed to a more general view model.
    function addFactoryChild(fName) {
      var view = this[fName]();
      this[fName + 'View'] = view;
      this.addChild(view);
      return view;
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

  listeners: [
    {
      name: 'onAnalyticsIdChange',
      code: function() {
        if ( ( ! this.data ) || ( ! this.ownAnalyticsView ) ) return;
        this.ownAnalyticsView[this.data.analyticsId ?
            'expand' : 'collapse']();
      },
    },
    {
      name: 'onABAnalyticsChange',
      code: function() {
        if ( ( ! this.data ) ) return;
        if ( this.analyticsThanksView )
          this.analyticsThanksView[this.data.appBuilderAnalyticsEnabled ?
              'expand' : 'collapse']();
        if ( this.analyticsNoThanksView )
          this.analyticsNoThanksView[this.data.appBuilderAnalyticsEnabled ?
              'collapse' : 'expand']();
        if ( this.abAnalyticsView )
          this.abAnalyticsView[this.data.appBuilderAnalyticsEnabled ?
              'expand' : 'collapse']();
      },
    },
    {
      name: 'onUserDataWarningChange',
      code: function() {
        if ( ( ! this.data ) || ( ! this.userDataWarningView ) ) return;
        this.userDataWarningView[this.data.userDataWarning ?
            'expand' : 'collapse']();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <export-confirm id="%%id">
        <div class="md-card-heading">
          <span class="md-headline">{{this.title}}</span>
        </div>
        <div class="md-card-heading-content-spacer"></div>
        <div class="main-confirm-content">

          <%= this.addFactoryChild('permissions') %>
          <% this.permissionsView.expand(); %>

          <div class="md-card-content">
            $$appBuilderAnalyticsEnabled{
              model_: 'foam.ui.md.CheckboxView',
              extraClassName: 'option',
            }
          </div>
          <%= this.addFactoryChild('analyticsThanks') %>
          <%= this.addFactoryChild('analyticsNoThanks') %>

          <%= this.addFactoryChild('ownAnalytics') %>
          <% this.onAnalyticsIdChange(); %>

          <%= this.addFactoryChild('abAnalytics') %>
          <% this.onABAnalyticsChange(); %>

          <%= this.addFactoryChild('userDataWarning') %>
          <% this.onUserDataWarningChange(); %>
        </div>
        <div class="md-card-content-footer-spacer"></div>
        <actions class="md-actions md-card-footer horizontal">
          $$cancel{ model_: 'foam.ui.md.FlatButton', displayMode: 'LABEL_ONLY' }
          $$confirm{ model_: 'foam.ui.md.FlatButton', displayMode: 'LABEL_ONLY' }
        </actions>
      </export-confirm>
    */},
    function prettyPermissionsHTML() {/*<%
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
    function warningsHTML() {/*
      <%= this.addFactoryChild('ownAnalytics') %>
      <% this.onAnalyticsIdChange(); %>

      <%= this.addFactoryChild('abAnalytics') %>
      <% this.onABAnalyticsChange(); %>
    */},
    function CSS() {/*
      export-confirm {
        display: block;
        max-width: 800px;
      }
      export-confirm img {
        margin-right: 12px;
      }
      export-confirm hr {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      export-confirm pre {
        margin: 0;
      }
      export-confirm .main-confirm-content {
        border-bottom: 1px solid rgba(0,0,0,0.1);
      }
      export-confirm .info-content {
        margin-left: 52px;
        margin-bottom: 8px;
      }
      export-confirm .option .md-grey {
        font-size: 14px;
        opacity: 1.0;
      }
      export-confirm .info {
        border-top: 1px solid rgba(0,0,0,0.1);
      }
      export-confirm .info-heading {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      export-confirm .default-hidden {
        display: none;
      }
      export-confirm .default-hidden.show {
        display: block;
      }
      export-confirm .rows {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
      }
      export-confirm .post-hr {
        padding-top: 16px;
      }
      export-confirm .warning {
        padding-top: 8px;
        padding-right: 36px;
      }
      export-confirm .rows img {
        flex-grow: 0;
      }
      export-confirm .rows span, export-confirm .rows div {
        flex-grow: 1;
      }
      @media (min-width: 600px) {
        export-confirm {
          min-width: 570px;
        }
      }
    */},
  ],
});
