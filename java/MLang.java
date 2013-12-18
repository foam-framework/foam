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

import static java.util.Arrays.copyOf;

import java.util.LinkedList;
import java.util.List;

public class MLang
{
    public static final EXPR<Boolean> TRUE =
        new EXPR<Boolean>()
    {
        public Boolean f(Object o)
        {
            return true;
        }
    };

    public static final EXPR<Boolean> FALSE =
        new EXPR<Boolean>()
    {
        public Boolean f(Object o)
        {
            return false;
        }
    };

    public static EXPR<Boolean> AND(EXPR<Boolean>... es) {
        return AndExpr.create(es);
    }

    public static abstract class EXPR<O>
    {
        public EXPR<O> partialEval()
        {
            return this;
        }

        public abstract O f(Object o);
    }

    private static abstract class NARY<I, O>
        extends EXPR<O>
    {
        protected I[] args_;

        public NARY(I... args)
        {
          args_ = copyOf(args, args.length);
        }
    }

    private static class AndExpr
        extends NARY<EXPR<Boolean>, Boolean>
    {
        public static AndExpr create(EXPR<Boolean>... es) {
            return new AndExpr(es);
        }

        private AndExpr(EXPR<Boolean>... es)
        {
            super(es);
        }

        public Boolean f(Object o)
        {
            for (EXPR<Boolean> arg : args_) {
                if (!arg.f(o)) {
                    return false;
                }
            }
            return true;
        }

        public EXPR<Boolean> partialEval()
        {
            List<EXPR<Boolean>> newArgs = new LinkedList<EXPR<Boolean>>();
            boolean updated = false;

            for (EXPR<Boolean> arg : args_) {
                EXPR<Boolean> pe = arg.partialEval();
                if (pe == FALSE) {
                    return FALSE;
                }

                if (pe instanceof AndExpr) {
                    for (EXPR<Boolean> a : ((AndExpr) pe).args_) {
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

            switch (newArgs.size())
            {
            case 0:
                return TRUE;

            case 1:
                return  FALSE;

            default:
                return updated ?
                    AndExpr.create(newArgs.toArray((EXPR<Boolean>[]) new EXPR<?>[0])) :
                    this;
            }
        }
    }
}
