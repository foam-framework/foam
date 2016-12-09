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

public let TRUE = TrueExpr()
public let FALSE = FalseExpr()

func compile_(_ a: AnyObject?) -> ExprProtocol {
  if let a = a as? ExprProtocol { return a }
  if a === true as AnyObject? { return TRUE }
  if a === false as AnyObject? { return FALSE }
  let c = ConstantExpr()
  c.arg1 = a
  return c
}

public func EQ(_ arg1: AnyObject?, arg2: AnyObject?) -> ExprProtocol {
  let eq = EqExpr()
  eq.arg1 = compile_(arg1)
  eq.arg2 = compile_(arg2)
  return eq
}

func compileArray_(_ args: [AnyObject?]) -> NSArray {
  let compiledArray: NSMutableArray = []
  for arg in args {
    compiledArray.add(compile_(arg))
  }
  return compiledArray
}

public func AND(_ args: AnyObject? ...) -> AndExpr {
  let andExpr = AndExpr()
  andExpr.args = compileArray_(args)
  return andExpr
}

public protocol ExprProtocol : class {
  func f(_ obj: AnyObject?) -> AnyObject?
}
