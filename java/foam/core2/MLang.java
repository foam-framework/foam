/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

package foam.core2;

import foam.core.AndExpr;
import foam.core.EqExpr;
import foam.core.FalseExpr;
import foam.core.TrueExpr;
import foam.core.ConstantExpr;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MLang {

  private static ExprInterface TRUE_;
  public static ExprInterface TRUE() {
    if (TRUE_ == null) {
      TRUE_ = new TrueExpr();
    }
    return TRUE_;
  }

  private static ExprInterface FALSE_;
  public static ExprInterface FALSE() {
    if (FALSE_ == null) {
      FALSE_ = new FalseExpr();
    }
    return FALSE_;
  }

  public static ExprInterface EQ(Object arg1, Object arg2) {
    EqExpr eq = new EqExpr();
    eq.setArg1(compile_(arg1));
    eq.setArg2(compile_(arg2));
    return eq;
  }

  private static ExprInterface compile_(Object a) {
    if (a instanceof ExprInterface) return (ExprInterface) a;
    if (a == Boolean.TRUE) return TRUE();
    if (a == Boolean.FALSE) return FALSE();
    ConstantExpr c = new ConstantExpr();
    c.setArg1(a);
    return c;
  }

  private static List<ExprInterface> compileArray_(List<Object> args) {
    List<ExprInterface> compiledArray = new ArrayList<ExprInterface>();
    for (Object arg : args) {
      compiledArray.add(compile_(arg));
    }
    return compiledArray;
  }

  public static ExprInterface AND(Object... args) {
    AndExpr andExpr = new AndExpr();
    andExpr.setArgs(compileArray_(Arrays.asList(args)));
    return andExpr;
  }

  public static boolean equals(Object a, Object b) {
    if (a == b) return true;
    if (a != null) return a.equals(b);
    return false;
  }
}
