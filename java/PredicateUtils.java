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

package foam.core;

import foam.core.MLang.EXPR;

public class PredicateUtils {
    public static EXPR<Boolean> toExpr(Predicate p)
    {
        return (p instanceof ExprPredicate) ?
            (ExprPredicate) p :
            new ExprPredicate(p);
    }

    public static Predicate toPredicate(EXPR<Boolean> e)
    {
        return (e instanceof ExprPredicate) ?
            (ExprPredicate) e :
            new ExprPredicate(e);
    }

    private static class ExprPredicate
        extends EXPR<Boolean>
        implements Predicate
    {
        final Predicate pDelegate_;
        final EXPR<Boolean> eDelegate_;

        private ExprPredicate(Predicate p) {
            pDelegate_ = p;
            eDelegate_ = null;
        }

        private ExprPredicate(EXPR<Boolean> e) {
            pDelegate_ = null;
            eDelegate_ = e;
        }

        public boolean p(Object o) {
            return pDelegate_ != null ? pDelegate_.p(o) : eDelegate_.f(o);
        }

        public Boolean f(Object o) {
            return pDelegate_ != null ? pDelegate_.p(o) : eDelegate_.f(o);
        }

        public ExprPredicate partialEval() {
             return pDelegate_ != null ? this :
                 new ExprPredicate(eDelegate_.partialEval());
        }
    }
}
