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

public class AbstractDAO
    implements DAO
{
    public Sink select(X x, Sink sink)
        throws DAOException, DAOInternalException
    {
        return select_(x, sink, null, null, 0, -1);
    }


    public void removeAll(X x, Sink sink)
        throws DAOException, DAOInternalException
    {
        removeAll_(x, sink, null);
    }


    /*****************************/

    public DAO where(Predicate p)
    {
        return new PredicatedDAO(p, this);
    }


    public DAO limit(long i)
    {
        return new LimitedDAO(i, this);
    }


    public DAO skip(long i)
    {
        return new SkipDAO(i, this);
    }


    /*****************************/

    public void listen(DAOListener listener)
    {
        throw UnsupportedOperationException("listen");
    }


    public void unlisten(DAOListener listener)
    {
        throw UnsupportedOperationException("unlisten");
    }


    public void pipe(DAOListener listener)
    {
        throw UnsupportedOperationException("pipe");
    }

}
