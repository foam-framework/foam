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

import Foundation

let TRUE = TrueExpr()
let FALSE = FalseExpr()

func compile_(a: AnyObject?) -> ExprProtocol {
  if let a = a as? ExprProtocol { return a }
  if a === true { return TRUE }
  if a === false { return FALSE }
  let c = ConstantExpr()
  c.arg1 = a
  return c
}

func EQ(arg1: AnyObject?, arg2: AnyObject?) -> ExprProtocol {
  let eq = EqExpr()
  eq.arg1 = compile_(arg1)
  eq.arg2 = compile_(arg2)
  return eq
}

func compileArray_(args: [AnyObject?]) -> NSArray {
  let compiledArray: NSMutableArray = []
  for arg in args {
    compiledArray.addObject(compile_(arg))
  }
  return compiledArray
}

func AND(args: AnyObject? ...) -> AndExpr {
  let andExpr = AndExpr()
  andExpr.args = compileArray_(args)
  return andExpr
}

protocol ExprProtocol : class {
  func f(obj: AnyObject?) -> AnyObject?
}
