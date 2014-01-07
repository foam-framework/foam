/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
var SATURN_ID = "dncjnngcblhgeeocnhmmihpanahkjbmi";

chrome.omnibox.setDefaultSuggestion({
  description: 'Search your email'
});

chrome.omnibox.onInputStarted.addListener(function(r) {
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest, r) {
  chrome.runtime.sendMessage(
    SATURN_ID,
    { command: "search", searchString: text },
    function (results) {
      if ( results )
        suggest(results);
      else
        console.log('Ooops. Invalid result');
    }
  );
});

chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
  // disposition is in [ "currentTab", "newForegroundTab", "newBackgroundTab" ]
  chrome.runtime.sendMessage(
    SATURN_ID,
    { command: "select", selectText: text },
    function() {});
});
