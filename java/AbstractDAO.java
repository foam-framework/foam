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

import java.lang.Iterable;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.PriorityQueue;

public abstract class AbstractDAO
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
        throw new UnsupportedOperationException("listen");
    }


    public void unlisten(DAOListener listener)
    {
        throw new UnsupportedOperationException("unlisten");
    }


    public void pipe(DAOListener listener)
        throws DAOException, DAOInternalException
    {
        // TODO:  Create an EmptyX?  Allow a supplied X?
        select(null, listener);
        listen(listener);
    }

    protected <T> Iterable<T> iterableSelectHelper(Iterable<T> ts, Predicate p, Comparator<T> c, final long skip, final long limit) {
        if (skip <= 0 && limit < 0 && c == null) {
            return ts;
        }

        if (limit == 0) {
            return Collections.<T>emptyList();
        }

        if (c != null) {
            PriorityQueue<T> ordered = new PriorityQueue<T>(limit >= 0 ? (int) limit : 10, c);
            for (T t : ts) {
                ordered.add(t);
            }
            ts = ordered;
        }

        if (skip <= 0 && limit < 0) {
          return ts;
        }

        final Iterator<T> input = ts.iterator();
        final Iterator<T> iter = new Iterator<T>() {
            int index = 0;

            @Override
            public T next() {
                maybeSkip();

                if (!hasNext()) {
                    throw new NoSuchElementException();
                }

                index++;
                return input.next();
            }

            @Override
            public boolean hasNext() {
                maybeSkip();
                return index < skip + limit && input.hasNext();
            }

            @Override
            public void remove() {
                throw new UnsupportedOperationException();
            }

            private void maybeSkip() {
                while (index < skip && input.hasNext()) {
                    input.next();
                    index++;
                }
            }
        };

        return new Iterable<T>() {
            @Override
            public Iterator<T> iterator() {
                return iter;
            }
        };
    }
}
