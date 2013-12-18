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
        if (limit == 0) {
            return Collections.<T>emptyList();
        }

        if (c != null) ts = new OrderedIterable<T>(ts, c);
        if (p != null) ts = new PredicatedIterable<T>(ts, p);
        if (skip > 0) ts = new SkipIterable<T>(ts, skip);
        if (limit >= 0) ts = new LimitIterable<T>(ts, limit);

        return ts;
    }

    private static abstract class DelegatingIterableIterator<T>
        implements Iterable<T>, Iterator<T>
    {
        protected final Iterator<T> delegate_;

        public DelegatingIterableIterator(Iterable<T> delegate)
        {
            delegate_ = delegate.iterator();
        }

        public Iterator<T> iterator()
        {
            return this;
        }

        public T next()
        {
            return delegate_.next();
        }

        public boolean hasNext()
        {
            return delegate_.hasNext();
        }

        public void remove()
        {
            delegate_.remove();
        }

        protected void assertHasNext()
        {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
        }
    }

    private static class PredicatedIterable<T>
        extends DelegatingIterableIterator<T>
    {
        final Predicate predicate_;
        T next_ = null;

        public PredicatedIterable(Iterable<T> delegate, Predicate predicate)
        {
            super(delegate);
            predicate_ = predicate;
        }

        public T next()
        {
            if (next_ == null) {
                attemptFetchNext();
            }
            assertHasNext();
            T result = next_;
            next_ = null;
            return result;
        }

        public boolean hasNext()
        {
            if (next_ == null) {
                attemptFetchNext();
            }
            return next_ != null;
        }

        private void attemptFetchNext()
        {
            while (next_ == null && super.hasNext()) {
                T maybeNext = super.next();
                if (predicate_.p(maybeNext)) {
                    next_ = maybeNext;
                }
            }
        }
    }

    private static class SkipIterable<T>
        extends DelegatingIterableIterator<T>
    {
        private long skip_;
        private boolean hasSkipped_ = false;

        public SkipIterable(Iterable<T> delegate, long skip)
        {
            super(delegate);
            skip_ = skip;
        }

        public T next()
        {
            maybeSkip();
            assertHasNext();
            return super.next();
        }

        public boolean hasNext()
        {
            maybeSkip();
            return super.hasNext();
        }

        public void remove()
        {
            maybeSkip();
            super.remove();
        }

        private void maybeSkip()
        {
            while (skip_ > 0 && super.hasNext()) {
                super.next();
                skip_--;
            }
        }
    }

    private static class LimitIterable<T>
        extends DelegatingIterableIterator<T>
    {
        private long limit_;

        public LimitIterable(Iterable<T> delegate, long limit)
        {
            super(delegate);
            limit_ = limit;
        }

        public T next()
        {
            assertHasNext();
            limit_--;
            return super.next();
        }

        public boolean hasNext() {
            return limit_ > 0 && super.hasNext();
        }
    }

    private static class OrderedIterable<T>
        extends DelegatingIterableIterator<T>
    {
        private final PriorityQueue<T> queue_;
        private boolean initialized_ = false;

        public OrderedIterable(Iterable<T> delegate, Comparator<T> comparator)
        {
            super(delegate);
            // 16 is an arbitrary size because the constructor forces you
            // to pick a size.
            queue_ = new PriorityQueue<T>(16, comparator);
        }

        public T next()
        {
            if (!initialized_) {
                initialize();
            }
            assertHasNext();
            return queue_.poll();
        }

        public boolean hasNext()
        {
            if (!initialized_) {
                initialize();
            }
            return !queue_.isEmpty();
        }

        public void remove()
        {
            throw new UnsupportedOperationException();
        }

        private void initialize()
        {
            while (super.hasNext()) {
                queue_.add(super.next());
            }
            initialized_ = true;
        }
    }
}
