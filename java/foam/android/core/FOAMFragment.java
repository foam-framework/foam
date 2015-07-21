package foam.android.core;

import android.app.Fragment;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;

import foam.core.HasX;
import foam.core.X;

/**
 * Wrapper for {@link Fragment} that adds {@link HasX}.
 */
public class FOAMFragment extends Fragment implements HasX, Memorable {
  private Bundle memento;
  private X x_;
  public X X() { return x_; }
  public void X(X x) { x_ = x; }

  public void setMemento(Bundle bundle) {
    memento = bundle;
  }

  public Bundle getMemento() {
    return memento;
  }

  @Override
  public void onCreate(Bundle savedState) {
    super.onCreate(savedState);
    setMemento(getArguments());
  }

  /**
   * Wraps a {@link LayoutInflater} to make sure it's got the correct FOAM {@link X} context.
   * @param inflater The original {@link LayoutInflater} passed to {@link #onCreateView}.
   * @return A new {@link LayoutInflater} that has the right FOAM context.
   */
  protected LayoutInflater decorateInflater(LayoutInflater inflater) {
    return inflater.cloneInContext(new XContext(getActivity(), X()));
  }

  protected X findX(Context context) {
    X x = null;
    if (context instanceof HasX) {
      x = ((HasX) context).X();
    } else if (getActivity() instanceof HasX) {
      x = ((HasX) getActivity()).X();
    }

    if (x == null) Log.e("FOAMFragment", "Could not locate X");
    return x;
  }
}
