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

public class ReverseComparator<T> implements Comparator<T> {
    
    public final Comparator<T> delegate_;

    public ReverseComparator(Comparator<T> delegate)
    {
        delegate_ = delegate;
    }

    public int compare(T o1, T o2)
    {
        return delegate_.compare(o2, o1);
    }
}
