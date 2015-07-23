package foam.core;

/**
 * Created by braden on 7/8/15.
 */
public interface Expression<O> extends Function<Object, O> {
  Expression<O> partialEval();
}
