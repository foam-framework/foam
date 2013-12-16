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

// TODO: make this a function tree rather than a linked list. (for performance)

class AbstractX
    implements X
{
    public Object get(String name)
    {
        return get(this, name);
    }

    public X put(String name, Object value)
    {
        return new XI(this, name, value);
    }

    public X putFactory(String name, XFactory factory)
    {
        return new FactoryXI(this, name, factory);
    }
}


class XI
    extends AbstractX
{
    final X      parent_;
    final String name_;
    final String value_;

    XI(X parent, String name, String value)
    {
        parent_ = parent;
        name_   = name;
        value_  = value;
    }

    X parent()
    {
        return parent_;
    }

    public Object get(X x, String name)
    {
        return name.equals(name_) ? value_ : parent().get(name);
    }

}


class FactoryXI
    extends AbstractX
{
    final X        parent_;
    final String   name_;
    final XFactory factory_;

    XI(X parent, String name, Factory factory)
    {
        parent_  = parent;
        name_    = name;
        factory_ = factory;
    }

    X parent()
    {
        return parent_;
    }

    public Object get(X x, String name)
    {
        return name.equals(name_) ?
            factory_.create(x)    :
            parent().get(x, name) ;
    }

}


public class EmptyX
    extends AbstractX
{
    private X x_ = new EmptyX();

    private EmptyX()
    {
    }

    public X instance()
    {
        return x_;
    }

    public Object get(X x, String name)
    {
        return null;
    }
}
