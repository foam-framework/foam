package foam.core;

/**
 * For objects that can be frozen and made immutable.
 */
public interface Freezable {
  void freeze();
  boolean isFrozen();
}
