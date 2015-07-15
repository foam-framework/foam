package foam.android.core;

import android.util.AttributeSet;

/**
 * Basic utilities for browsing {@link AttributeSet}s.
 */
public class AttributeUtils {
  public static String find(AttributeSet attrs, String key) {
    if (attrs == null) return null;
    int count = attrs.getAttributeCount();
    for (int i = 0; i < count; i++) {
      if (attrs.getAttributeName(i).equals(key)) {
        return attrs.getAttributeValue(i);
      }
    }
    return null;
  }

  public static boolean findBoolean(AttributeSet attrs, String key, boolean defaultValue) {
    String s = find(attrs, key);
    if (s == null) return defaultValue;
    return Boolean.parseBoolean(s);
  }
}
