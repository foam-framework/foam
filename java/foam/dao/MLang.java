/**
 * @license Copyright 2013 Google Inc. All Rights Reserved.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package foam.dao;

import java.util.LinkedList;
import java.util.List;

import foam.core.Expression;
import foam.core.FObject;
import foam.core.Property;
import foam.core.X;

import static java.util.Arrays.copyOf;

public class MLang {
  public static final Expression<Boolean> TRUE =
      new AbstractExpression<Boolean>() {
        public Boolean f(Object o) {
          return true;
        }
      };

  public static final Expression<Boolean> FALSE =
      new AbstractExpression<Boolean>() {
        public Boolean f(Object o) {
          return false;
        }
      };

  // TODO(braden): Figure out if the "parameterized vararg" warning can be ignored, and suppress.
  public static Expression<Boolean> AND(Expression<Boolean>... es) {
    return new AndExpr(es);
  }

  private static abstract class AbstractExpression<T> implements Expression<T> {
    public Expression<T> partialEval() {
      return this;
    }

    public abstract T f(Object o);
  }

  private static abstract class NARY<I, O> extends AbstractExpression<O> {
    protected I[] args_;

    public NARY(I... args) {
      args_ = copyOf(args, args.length);
    }
  }

  private static class AndExpr extends NARY<Expression<Boolean>, Boolean> {
    public AndExpr(Expression<Boolean>... es) {
      super(es);
    }

    public Boolean f(Object o) {
      for (Expression<Boolean> arg : args_) {
        if (!arg.f(o)) {
          return false;
        }
      }
      return true;
    }

    public Expression<Boolean> partialEval() {
      List<Expression<Boolean>> newArgs = new LinkedList<Expression<Boolean>>();
      boolean updated = false;

      for (Expression<Boolean> arg : args_) {
        Expression<Boolean> pe = arg.partialEval();
        if (pe == FALSE) {
          return FALSE;
        }

        if (pe instanceof AndExpr) {
          for (Expression<Boolean> a : ((AndExpr) pe).args_) {
            newArgs.add(a);
          }
          updated = true;
        } else {
          if (pe == TRUE) {
            // Don't need to add it to new args.  No need to re-evaluate
            updated = true;
          } else {
            newArgs.add(pe);
            if (pe != arg) {
              updated = true;
            }
          }
        }
      }

      switch (newArgs.size()) {
        case 0:
          return TRUE;

        case 1:
          return newArgs.get(0);

        default:
          return updated ?
              new AndExpr(newArgs.toArray((Expression<Boolean>[]) new Expression<?>[0])) :
              this;
      }
    }
  }


  private static abstract class Unary<I, O> extends AbstractExpression<O> {
    protected I arg1_;
    public Unary(I arg1) {
      arg1_ = arg1;
    }
  }

  private static class NotExpr extends Unary<Expression<Boolean>, Boolean> {
    public NotExpr(Expression<Boolean> arg) {
      super(arg);
    }

    public Expression<Boolean> partialExpr() {
      arg1_ = arg1_.partialEval();
      if (arg1_ == TRUE) return FALSE;
      else if (arg1_ == FALSE) return TRUE;
      return this;
    }

    public Boolean f(Object o) {
      return !arg1_.f(o);
    }
  }
  public static Expression<Boolean> NOT(Expression<Boolean> e) {
    return new NotExpr(e);
  }


  private static abstract class Binary<I, J, O> extends Unary<I, O> {
    protected J arg2_;
    public Binary(I i, J j) {
      super(i);
      arg2_ = j;
    }
  }

  private static class EqExpr<T> extends Binary<Expression<T>, Expression<T>, Boolean> {
    public EqExpr(Expression<T> arg1, Expression<T> arg2) {
      super(arg1, arg2);
    }

    public Boolean f(Object o) {
      return arg1_.f(o).equals(arg2_.f(o));
    }
  }

  public static <T> Expression<Boolean> EQ(Expression<T> arg1, Expression<T> arg2) {
    return new EqExpr<T>(arg1, arg2);
  }
  public static <T> Expression<Boolean> EQ(Expression<T> arg1, T arg2) {
    return new EqExpr<T>(arg1, new ConstantExpr<T>(arg2));
  }

  public static <T> Expression<Boolean> NEQ(Expression<T> arg1, Expression<T> arg2) {
    return new NotExpr(new EqExpr<T>(arg1, arg2));
  }
  public static <T> Expression<Boolean> NEQ(Expression<T> arg1, T arg2) {
    return new NotExpr(new EqExpr<T>(arg1, new ConstantExpr<T>(arg2)));
  }


  private static class ConstantExpr<T> extends Unary<T, T> {
    public ConstantExpr(T a) {
      super(a);
    }
    public Expression<T> partialEval() {
      return this;
    }
    public T f(Object o) {
      return arg1_;
    }
  }



  public static CountSink COUNT() {
    return new CountSink();
  }
  public static class CountSink implements Sink {
    private long count = 0;
    public FObject put(X x, FObject obj) {
      count++;
      return obj;
    }

    public long getCount(){
      return count;
    }
    public void setCount(long c) {
      count = c;
    }
  }

  public static MaxSink MAX(Property prop) { return new MaxSink(prop); }
  public static class MaxSink implements Sink {
    private FObject maxHolder;
    private Property prop;

    public MaxSink(Property prop) {
      this.prop = prop;
    }

    public FObject put(X x, FObject obj) {
      if (maxHolder == null || prop.compare(obj, maxHolder) > 0) {
        maxHolder = obj;
      }
      return obj;
    }

    public Object getMax() {
      return maxHolder == null ? null : prop.get(maxHolder);
    }
  }
}
