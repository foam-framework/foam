package foam.android.core;

import android.app.Fragment;
import android.view.LayoutInflater;

import foam.core.HasX;
import foam.core.X;

/**
 * Wrapper for {@link Fragment} that adds {@link HasX}.
 */
public class FOAMFragment extends Fragment implements HasX {
  private X x_;
  public X X() { return x_; }
  public void X(X x) { x_ = x; }

  /**
   * Wraps a {@link LayoutInflater} to make sure it's got the correct FOAM {@link X} context.
   * @param inflater The original {@link LayoutInflater} passed to {@link #onCreateView}.
   * @return A new {@link LayoutInflater} that has the right FOAM context.
   */
  protected LayoutInflater decorateInflater(LayoutInflater inflater) {
    return inflater.cloneInContext(new XContext(getActivity(), X()));
  }
}
