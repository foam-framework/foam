public abstract class AbstractFObject {

  public int equals(String o1, String o2) {
    if ( o1 == o2 ) return 0;
    if ( o1 == null ) return -1;
    if ( o2 == null ) return 1;
    
    return o1.compareTo(o2);
  }
  
  public int equals(short o1, short o2) {
    short diff = o1 - o2;
    return diff == 0 ? 0 : diff > 0 ? 1 : -1;
  }
  
  public int equals(int o1, int o2) {
    int diff = o1 - o2;
    return diff == 0 ? 0 : diff > 0 ? 1 : -1;
  }
  
  public int equals(long o1, long o2) {
    long diff = o1 - o2;
    return diff == 0 ? 0 : diff > 0 ? 1 : -1;
  }
  
  public int equals(float o1, float o2) {
    float diff = o1 - o2;
    return diff == 0 ? 0 : diff > 0 ? 1 : -1;
  }
  
  public int equals(double o1, double o2) {
    double diff = o1 - o2;
    return diff == 0 ? 0 : diff > 0 ? 1 : -1;
  }
  
  
  public int hash(String s) { return s == null ? 0 : s.hashCode(); }
  public int hash(short s) { return i; }
  public int hash(int i) { return i; }
  public int hash(long l) { return (int)(l^(l>>>32)); }
  public int hash(float f) { return i; }
  public int hash(double d) { return hash(Double.doubleToLongBits(d)); }
  
}