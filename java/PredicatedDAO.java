/**
 *
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

import static foam.core.MLang.AND;
import static foam.core.MLang.TRUE;
import static foam.core.PredicateUtils.toExpr;
import static foam.core.PredicateUtils.toPredicate;

import java.util.Comparator;

public class PredicatedDAO
    extends ProxyDAO
{
    protected Predicate predicate_;

    public PredicatedDAO(Predicate p, DAO delegate)
    {
        super(delegate);

        setPredicate(p);
    }

    public Predicate getPredicate()
    {
        return predicate_;
    }

    public void setPredicate(Predicate predicate)
    {
        predicate_ = predicate;
    }

    public Sink select_(X x, Sink sink, Predicate p, Comparator c, long skip, long limit)
        throws DAOException, DAOInternalException
    {
        if (p == null) {
          p = toPredicate(TRUE);
        }
        Predicate p2 = toPredicate(AND(toExpr(getPredicate()), toExpr(p)).partialEval());

        return getDelegate().select_(x, sink, p2, c, skip, limit);
    }

}
