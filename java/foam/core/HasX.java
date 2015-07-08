package foam.core;

/**
 * Interface for anything with a FOAM context ({@link X} object) attached.
 */
public interface HasX {
  X getX();
  void setX(X x);
}
