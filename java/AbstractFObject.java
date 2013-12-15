package foam.core;

public abstract class AbstractFObject {

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


  public equals(Object o) {
    return this.compareTo(o) == 0;
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    append(sb);
    return sb;
  }

}