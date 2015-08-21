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

package foam.dao;

import java.util.Comparator;

import foam.core.Expression;
import foam.core.X;

public class LimitedDAO
    extends ProxyDAO
{
    protected long limit_;

    public LimitedDAO(long limit, DAO delegate)
    {
        super(delegate);

        setLimit(limit);
    }

    public long getLimit()
    {
        return limit_;
    }

    public void setLimit(long limit)
    {
        limit_ = limit;
    }

    public Sink select_(X x, Sink sink, Expression<Boolean> p, Comparator c, long skip, long limit)
        throws DAOException, DAOInternalException
    {
        long l2 = limit == -1 ? getLimit() : Math.min(limit, getLimit());

        return getDelegate().select_(x, sink, p, c, skip, l2);
    }

}
