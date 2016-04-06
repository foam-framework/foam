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
  package: 'foam.swift.ui',
  name: 'FoamUITextField',
  swiftClassImports: ['UIKit'],
  swiftImplements: ['UITextFieldDelegate'],
  properties: [
    {
      name: 'view',
      swiftType: 'UITextField',
      swiftFactory: 'return UITextField()',
      swiftPostSet: function() {/*
        newValue.text = self.valueToText(self.data)
        newValue.delegate = self
      */},
    },
    {
      name: 'data',
      swiftPostSet: function() {/*
        self.view.text = self.valueToText(newValue)
      */},
    },
  ],
  methods: [
    {
      name: 'textToValue',
      args: [
        {
          name: 'text',
          swiftType: 'String',
        },
      ],
      swiftReturnType: 'AnyObject',
      swiftCode: function() {/*
        return text
      */},
    },
    {
      name: 'valueToText',
      args: [
        {
          name: 'value',
          swiftType: 'AnyObject?',
        },
      ],
      swiftReturnType: 'String',
      swiftCode: function() {/*
        if value != nil {
          return String(value!)
        }
        return ""
      */},
    },
    {
      name: 'textFieldDidEndEditing',
      args: [
        {
          name: 'textField',
          swiftType: 'UITextField',
        },
      ],
      swiftCode: function() {/*
        data = textToValue(textField.text!)
      */},
    }, 
    {
      name: 'textFieldShouldReturn',
      args: [
        {
          name: 'textField',
          swiftType: 'UITextField',
        },
      ],
      swiftReturnType: 'Bool',
      swiftCode: function() {/*
        textField.resignFirstResponder()
        return true
      */},
    }, 
  ],
});
