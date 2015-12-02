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
  package: 'foam.grammars',
  name: 'CSSDeclTest',

  requires: [ 'foam.grammars.CSSDecl' ],
  imports: [ 'assert' ],

  properties: [
    {
      type: 'foam.grammars.CSSDecl',
      name: 'css',
      defaultValue: ''
    }
  ],

  methods: [
    function testSetUp() {
      this.css = this.CSSDecl.create();
    },
    function testTearDown() {
      this.css = '';
    },
    function parseString(str, opt_production) {
      var production = opt_production || 'START';
      var p = this.css.parser;
      var ps = p.stringPS;
      ps.str = str;
      var res = p.parse(p[production], ps);

      return res;
    },
    function testProduction(production, posEg, opt_negEg) {
      var negEg = opt_negEg || [], results = [];
      var res, i;
      for ( i = 0; i < posEg.length; ++i ) {
        res = this.parseString(posEg[i], production);
        this.assert(res && typeof res.value === 'string' &&
            res.toString() === '',
                    'Expected parse from "' + posEg[i] + '" on production "' +
                        production + '"');
        results.push(res);
      }
      for ( i = 0; i < negEg.length; ++i ) {
        try {
          res = this.parseString(negEg[i], production);
          this.assert(!(res && res.value) || res.toString() !== '',
                      'Expected parse failure from "' + negEg[i] +
                          '" on production "' + production + '"');
          results.push(res);
        } catch (e) {
          results.push(res);
        }
      }
      return results;
    },
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test stylesheet production',
      code: function() {
        var posEgs = [
          '',
          'a;',
          ' a; ',
          'a{}',
          ' a {} ',
          'a .b{}',
          'a .b {}',
          'a .b #c {}',
          'a .b #c:d {}',
          'a .b #c:d e::f {}',
          'a;b{}',
          ' a ; b { } ',
          'a { b: c }',
          'a { b: c; }',
          'a { b{} }',
          'a { b #c:d e::f {} }',
          'a { b{ c{} } }',
          'a { b{ #c:d e::f {} } }',
          'a { b{ c{ d: e; f: g; } } }',
        ];
        var negEgs = [
          '}',
          ' }',
          ' } ',
          'a { b{} c; }',
          'a { b; c{} }',
          'a { b: c; d{} }',
        ];

        this.testProduction('stylesheet', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test declaration rewrite',
      code: function() {
        var prefixes = this.css.PREFIXES;
        var keys = this.css.PREFIXED_KEYS;
        var posEgs = [];
        var negEgs = [];
        var expected = [];
        Object_forEach(keys, function(v, k) {
          posEgs.push('a{' + k + ':' + v + '}');
          var exp = [];
          for ( var i = 0; i < prefixes.length; ++i ) {
            if ( v === true ) exp.push(prefixes[i] + k + ':' + v);
            else              exp.push(k + ':' + prefixes[i] + v);
          }
          expected.push(exp);
        });

        var results = this.testProduction('stylesheet', posEgs, negEgs);
        this.assert(results.length == expected.length, 'Expected number of ' +
            'results to match number of expectations');
        for ( var i = 0; i < results.length; ++i ) {
          for ( var j = 0; j < expected[i].length; ++j ) {
            this.assert(results[i].value.indexOf(expected[i][j]) >= 0,
                        'Expected parse value "' + results[i].value + '" to ' +
                            'contain "' + expected[i][j] + '"');
          }
        }
      }
    },
    {
      model_: 'UnitTest',
      name: 'Function-in-function',
      description: 'Test functions in functions',
      code: function() {
        var posEgs = [
          multiline(function() {/*
@font-face {
background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
}
*/}),
        ];
        var negEgs = [];

        var results = this.testProduction('stylesheet', posEgs, negEgs);

        var result = results[0].value;
        var expected = '@font-face{background:-webkit-gradient(linear, left ' +
            'top, left bottom, color-stop(0.05, #ededed), color-stop(1, ' +
            '#dfdfdf))}';
        this.assert(result === expected, 'Expected parse to be "' + expected +
            '", and got "' + result + '"');
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test large stylesheet',
      code: function() {
        var posEgs = [
                    multiline(function() {/*
html, body {
  margin: 0px;
  padding: 0px;
}

body {
  font-family: Roboto, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif;
  font-size: 12px;
}
p, h1, form, button {
  border: 0;
  margin: 0;
  padding: 0;
}

.spacer {
  clear: both;
  height: 1px;
}

.foamform {
  margin: 0 auto;
  width: 450px;
  padding: 14px;
}

.stackview {
  width: 100%;
}

.stackview-viewarea {
  width: 100%;
}

.stackview-previewarea {
  height: 100%;
}

.stackview-previewarea .actionToolbar {
  display: none;
}

.stackview-slidearea {
  background: white;
  box-shadow: 0px 0px 30px black;
  height: 100%;
  position: fixed;
  z-index: 4;
}

.stackview-dimmer {
  background: black;
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
}


.detailView {
  display: table;
  border: solid 2px #dddddd;
  background: #fafafa;
  width: 99%;
}

.detailView .heading {
  float: left;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.detailView .propertyLabel {
  font-size: 14px;
  display: block;
  font-weight: bold;
  text-align: right;
  float: left;
}

.detailView input {
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
}

.detailView textarea {
  float: left;
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
  width: 98%;
  overflow: auto;
}

.detailView select {
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
}

.detailView .label {
  vertical-align: top;
}

.detailArrayLabel {
  font-size: medium;
}

.detailArrayLabel .foamTable {
  margin: 1px;
  width: 99%;
}


.summaryView {
  background: white;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.summaryView .table {
  table-layout: fixed;
}

.summaryView td: first-child { width: 50px; }

.summaryView .label{
  font-size: 14px;
  display: block;
  font-weight: bold;
  text-align: right;
  width: 120px;
  float: left;
}

.summaryView .value{
  float: left;
  font-size: 12px;
  padding-left: 8px;
  margin: 2px 15px 2px 0px;
}


.foamSearchView select{
  font-family: 'Courier New', Courier, monospace;
}

.helpView {
  width: 100%;
}

.helpView .intro{
  padding-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.helpView .label{
  padding-top: 10px;
  font-size: 14px;
  font-weight: bold;
}

.helpView .text{
  width: 100%;
  font-size: 14px;
  padding-left: 8px;
  margin: 2px 15px 2px 0px;
}

.actionBorder {
  width: 95%;
}

.actionToolbar {
  float: right;
}

.actionBorderActions {
  padding-right: 15px;
  text-align: right;
}

.ActionMenuPopup {
  position: absolute;
  width: 150px;
  border: 2px solid grey;
  background: white;
}

.ActionMenu .actionButton {
  background: white;
  border: none;
  border-radius: 0;
  text-align: left;
  width: 100%;
}

.imageView {
  display: inline-block;
}

#stylized {
  border: solid 2px #b7ddf2;
  background: #ebf4fb;
}
#stylized h1 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}
#stylized p{
  font-size: 11px;
  color: #666666;
  margin-bottom: 20px;
  border-bottom: solid 1px #b7ddf2;
  padding-bottom: 10px;
}
#stylized label{
  display: block;
  font-weight: bold;
  text-align: right;
  width: 140px;
  float: left;
}
#stylized .small{
  color: #666666;
  display: block;
  font-size: 11px;
  font-weight: normal;
  text-align: right;
  width: 140px;
}
#stylized input{
  float: left;
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 20px 10px;
  width: 200px;
}
#stylized button{
  background: #666666;
  clear: both;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: bold;
  height: 31px;
  line-height: 31px;
  margin-left: 150px;
  text-align: center;
  width: 125px;
}


.foamTable {
  background: #fff;
  border-collapse: collapse;
  font-family: Roboto, "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
  font-size: 12px;
  margin: 10px;
  table-layout:fixed;
  text-align: left;
  width: 98%;
}
.BookmarkTable {
  width: 800px;
}
.foamTable caption {
  font-size: 16px;
  font-weight: bold;
  color: #039;
  padding: 10px 8px;
  text-align: left;
}
.foamTable th {
  font-size: 14px;
  font-weight: normal;
  color: #039;
  padding: 10px 8px;
  border-bottom: 2px solid #6678b1;
}
.foamTable td {
  color: #669;
  padding: 4px 8px 4px 8px;
}
.foamTable tbody tr:hover td {
  color: #009;
  background: #eee;
}
.foamTable tbody tr.rowSoftSelected td {
  color: #009;
  background: #eee;
}
.foamTable tr.rowSelected {
  color: #900;
  background: #eee;
  border: 2px solid #f00;
}
.foamTable .numeric {
  text-align: right;
}

button.actionButton {
  -webkit-box-shadow: inset 0 1px 0 0 #ffffff;
  box-shadow: inset 0 1px 0 0 #ffffff;
  background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
  background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% );
  background-color: #ededed;
  -moz-border-radius: 3px;
  -webkit-border-radius: 3px;
  border-radius: 3px;
  border: 1px solid #dcdcdc;
  display: inline-block;
  color: #777777;
  font-family: arial;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 16px;
  text-decoration: none;
  visibility: hidden;
}

button.actionButton.available {
  visibility: visible;
}

button.actionButton:hover {
  background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) );
  background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% );
  background-color: #dfdfdf;
}

.actionButton img {
  vertical-align: middle;
}

.scrollSpacer {
  height: 52;
}

.foamTable td,
.foamTable th,
.summaryView td,
.summaryView th,
.detailView td,
.detailView th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow:ellipsis;
}

select {
  background-color:rgb(240,240,240);
  margin-bottom: 15px;
}

.foamSearchViewLabel {
  margin-top: 5px;
  padding-left: 4px;
}

.searchTitle {
  color:#039;
  font-size: 16px;
  padding-left: 5px;
}

.messageBody {
  white-space: normal;
}

.summaryView table {
  width: 100%;
}

.summaryView .label[colspan="2"] {
  width: 100%;
}

.summaryView .label {
  width: 30%;
}

div.gridtile td div a {
  color: #000;
  text-decoration: none;
  white-space: normal;
}

div.gridtile {
  width: 10em;
  float: left;
  margin: 2px;
}

div.gridtile {
  border: 2px solid #c3d9ff;
  border-radius: 6px;
  padding: 1px;
}

div.gridtile td.id {
  width: 5em;
  text-align: left;
  margin-left: 4px;
}

div.gridtile td.id a {
  margin-left: 4px;
}

div.gridtile td.status {
  font-size: 11px;
  text-align: right;
  width: 70%;
}

div.gridtile table, div.projecttile table {
  width: 100%;
  table-layout: fixed;
}

div.gridtile td, div.projecttile td {
  border: 0;
  padding: 2px;
  overflow: hidden;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
}

div.gridtile td div {
  height: 5.5ex;
  font-size: 90%;
  line-height: 100%;
}

div.gridViewControl {
  padding: 5px;
  background: rgb(235, 239, 249);
  border-color: rgb(187, 187, 187);
  border-style: solid;
  border-width: 1px;
}

div.gridViewControl select {
  margin-bottom: 6px;
  font-family: arial, sans-serif;
  font-size: 10px;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  color: rgb(0, 0, 0);
  outline-color: rgb(223, 215, 207);
  background-color: rgb(221, 221, 221);
}

.gridBy th {
  background: #eeeeee;
  border: 1px solid #ccc;
  border-spacing: 2px;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
  font-variant: normal;
  font-weight: bold;
  padding: 2px;
  text-align: left;
}

.gridBy td {
  vertical-align: top;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 4px;
}

.idcount {
  color: #0000cc;
  text-decoration: underline;
  font: 82% arial,sans-serif;
}

.idlist {
  color: #0000cc;
  text-decoration: underline;
  font: 82% arial,sans-serif;
}


.buttonify {
  font-size: 100%;
  background: url("//ssl.gstatic.com/codesite/ph/images/button-bg.gif") repeat-x scroll left top #e3e3e3;
  background: -webkit-gradient(linear,0% 40%,0% 70%,from(#f9f9f9),to(#e3e3e3));
  background: -moz-linear-gradient(top,#fff,#ddd);
  vertical-align: baseline;
  padding: 1px 3px 1px 3px;
  border: 1px solid #aaa;
  border-top-color: #ccc;
  border-bottom-color: #888;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
}

.mode_button_active
{
  background: url("//ssl.gstatic.com/codesite/ph/images/button-bg.gif") repeat-x scroll left bottom #bbb;
  background: -webkit-gradient(linear,0% 40%,0% 70%,from(#e3e3e3),to(#f9f9f9));
  background: -moz-linear-gradient(top,#e3e3e3,#f9f9f9);
  border-color: #aaa;
}

.capsule_right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.capsule_left {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.altViewButtons {
  margin-right: 17px;
  float: right;
}

.arrayTileView {
  margin: 0;
  width: 100%;
  padding: 0px;
  display: inline-block;
  border-bottom: 2px inset;
}

.arrayTileItem {
  display: inline-block;
  list-style-type: none;
  margin: 2px 2px;
}

.arrayTileLastView {
  display: inline-block;
  margin: 0;
  list-style-type: none;
  vertical-align: 7px;
}

.listInputView {
  width: 100%;
  border: none;
  padding: 1px 0 1px 8px;
  outline: none;
  height: 36px;
}

.autocompleteListView {
  position: absolute;
  padding: 8px;
  margin: 0px;
  width: 300px;
  background: white;
  border-radius: 5px;
  border: 1px solid lightgrey;
  z-index: 10;
}

.autocompleteListItem {
  border: 1px solid transparent;
  border-radius: 3px;
  list-style-type: none;
  overflow: hidden;
}

.autocompleteSelectedItem {
  border: 1px solid #99e;
}

.richtext {
  overflow: hidden;
  position: relative;
}

.richtext iframe {
  background: white;
  height: 100%;
  position: absolute;
}

.dropzone {
  -webkit-box-orient: vertical;
  border: 4px dashed #ddd;
  box-sizing: border-box;
  color: #ddd;
  display: -webkit-box;
  font: 270% arial,sans-serif;
  height: 94%;
  margin: 7px;
  position: absolute;
  text-align: center;
  width: 95%;
  z-index: -1;
}

.dropzone .spacer {
  -webkit-box-flex: 1;
}

::-webkit-input-placeholder {
  color: #999;
  font-family: Arial;
  font-size: 13px;
  font-weight: normal;
}

.richtext .placeholder {
  color: #999;
  font-family: Arial;
  font-size: 13px;
  padding: 6px;
  position: absolute;
  z-index: 2;
}

.linkDialog {
  border: 1px solid;
  border-color: #bbb #bbb #a8a8a8;
  padding: 8px;
  z-index: 2;
  background: white;
}


.linkDialog .actionButton-insert {
  background: #4d90fe;
  border-radius: 3px;
  box-shadow: none;
  color: white;
  margin-left: 7px;
  padding: 10px 16px;
  text-shadow: none;
}

.linkDialog input  {
  height: 32px;
  padding-left: 8px;
  margin: 2px;
  border: 1px solid #d9d9d9 !important;
}

.linkDialog input[name="label"] {
  width: 99%;
}

.linkDialog th {
  font: normal 15px arial,sans-serif;
  padding-right: 10px;
}

.actionButton:disabled { color: #bbb; -webkit-filter: grayscale(0.8); }

.editColumnView {
  font-size: 80%;
  font-weight: normal;
  z-index: 2;
}
.editColumnView td {
  color: #0000cc;
  font-size: 80%;
  font-weight: normal;
  padding: 1px;
  text-align2: left;
}

.multiLineStringRemove {
  float: right;
}


.column {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.expand {
  flex: 1 1 auto;
}

.rigid {
  flex: none;
}

.waiting * {
  cursor: wait;
  x-unused: white;
}

input.clickToEnableEdit:not(:focus) {
  border: none;
  background-color: inherit;
}

.galleryView {
  text-align: center;
}

.galleryView .swipeAltInner {
  overflow: hidden;
}

.galleryCirclesOuter {
  float: left;
  text-align: center;
  position: relative;
  width: 100%;
  bottom: 20px;
}

.galleryCircle {
  display: inline-block;
  margin: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #aaa;
}

.galleryCircle.selected {
  background-color: #333;
}

.galleryImage {
  width: 100%;
}

.foamTest {
  border: 1px solid black;
  border-radius: 5px;
  line-height: 150%;
  margin: 2px;
  padding: 6px;
}

.foamTestPassed {
  background-color: #cfc;
}

.foamTestFailed {
  background-color: #fcc;
}

.foamInnerTests {
  padding-left: 10px;
}

.foamTestOutput {
  background-color: #e3e3e3;
  margin: 4px;
  padding: 5px;
}

@media not print {

  @media (max-width: 800px) {

    book-title {
      border: 2px solid rgba(0,0,0);
      font-weight: bold;
      font-size: 40px;
      margin-top: 15px;
    }

  }

  @media (min-width: 800px) {

    book-title {
      font-weight: bold;
      font-size: 50px;
      margin-top: 20px;
    }

  }

}

@import url(http://www.google.com);

@media print {

  book-title {
    font-weight: bold;
    font-size: 32pt;
    margin-top: 1in;
  }

}
@font-face {
  font-family: 'RobotoDraft';
  font-style: normal;
  font-weight: 300;
  src: url('data:font/woff2;base64,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') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;
}

          */}),
        ];
        var negEgs = [];

        this.testProduction('stylesheet', posEgs, negEgs);
      }
    },
  ],
});
