package foam.core;

/**
 * Interface for anything with a FOAM context ({@link X} object) attached.
 */
public interface HasX {
  X X();
  void X(X x);
}
