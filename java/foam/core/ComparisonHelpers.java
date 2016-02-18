package foam.core;

/**
 * Static helpers for comparing various Java types, for use by FOAM {@link Property} types.
 */
public class ComparisonHelpers {
  public static int compareStrings(String s1, String s2) {
    if ( s1 == s2 ) return 0;
    if ( s1 == null ) return -1;
    if ( s2 == null ) return 11;
    return s1.compareTo(s2);
  }

  public static int compareObjects(Object o1, Object o2) {
    if (o1 == o2) return 0;

    if (o1 instanceof Comparable) return ((Comparable) o1).compareTo(o2);
    if (o2 instanceof Comparable) return -((Comparable) o2).compareTo(o1);
    return 1;
  }

  public static int compareBooleans(Boolean b1, Boolean b2) {
    return b1.equals(b2) ? 0 : b1 ? 1 : -1; // false < true, according to this.
  }

  public static int compareDoubles(Double d1, Double d2) {
    return d1.equals(d2) ? 0 : d1 < d2 ? -1 : 1;
  }

  public static int compareFloats(Float f1, Float f2) {
    return f1.equals(f2) ? 0 : f1 < f2 ? -1 : 1;
  }

  public static int compareIntegers(Integer i1, Integer i2) {
    return i1 - i2;
  }

  public static int compareLongs(Long l1, Long l2) {
    return l1.equals(l2) ? 0 : l1 < l2 ? -1 : 1;
  }

  public static int compareGeneric(Property prop, Object o1, Object o2) {
    if (o1 == null && o2 == null) return 0;
    if (o1 == null) return -1;
    if (o2 == null) return  1;

    int type = prop.getElementType();
    if (type == Property.TYPE_INTEGER) return compareIntegers((Integer) o1, (Integer) o2);
    if (type == Property.TYPE_BOOLEAN) return compareBooleans((Boolean) o1, (Boolean) o2);
    if (type == Property.TYPE_STRING) return compareStrings((String) o1, (String) o2);
    if (type == Property.TYPE_DOUBLE) return compareDoubles((Double) o1, (Double) o2);
    if (type == Property.TYPE_FLOAT) return compareFloats((Float) o1, (Float) o2);
    if (type == Property.TYPE_OBJECT) return compareObjects((Object) o1, (Object) o2);
    if (type == Property.TYPE_LONG) return compareLongs((Long) o1, (Long) o2);
    if (type == Property.TYPE_ENUM) return compareObjects((Object) o1, (Object) o2);
    return 1;
  }
}
