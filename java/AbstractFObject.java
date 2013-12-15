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

public abstract class AbstractFObject
    implements FCloneable
{

  public int compare(boolean o1, boolean o2) {
    return o1 == o2 ? 0 : o1 ? 1 : 0;
  }

  public int compare(String o1, String o2) {
    return o1 == o2 ? 0 : o1 == null ? -1 : o2 == null ? 1 : o1.compareTo(o2);
  }
  
  public int compare(short  o1, short  o2) { return Short.compare(o1, o2);   }
  public int compare(int    o1, int    o2) { return Integer.compare(o1, o2); }
  public int compare(long   o1, long   o2) { return Long.compare(o1, o2);    }
  public int compare(float  o1, float  o2) { return Float.compare(o1, o2);   }
  public int compare(double o1, double o2) { return Double.compare(o1, o2);  }
  
  
  public int hash(Boolean b) { return b ? 1 ? 0; }
  public int hash(String s)  { return s == null ? 0 : s.hashCode(); }
  public int hash(short s)   { return s; }
  public int hash(int i)     { return i; }
  public int hash(long l)    { return (int)(l^(l>>>32)); }
  public int hash(float f)   { return hash(Float.floatToIntBits(f)); }
  public int hash(double d)  { return hash(Double.doubleToLongBits(d)); }


  public String toString() {
    StringBuilder sb = new StringBuilder();
    append(sb);
    return sb;
  }

}