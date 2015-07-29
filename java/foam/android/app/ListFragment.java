package foam.android.app;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import foam.android.core.FOAMFragment;
import foam.core.FObject;
import foam.core.Value;
import foam.core.X;
import foam.dao.DAO;


/**
 * A placeholder fragment containing a simple view.
 */
public class ListFragment extends FOAMFragment implements View.OnClickListener {
  //@IdRes private static final int coordinatorId = 1780;
  //@IdRes private static final int fabId = 1781;

  //private static final Bitmap plusBitmap = makePlusBitmap();

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container,
                           Bundle savedInstanceState) {
    X x = findX(container.getContext());
    if (x == null) return null;
    X(x.put("data", x.getValue("dao")));

    container.removeAllViews();

    /*
    Context context = container.getContext();
    CoordinatorLayout outerLayout = new CoordinatorLayout(context);
    outerLayout.setId(coordinatorId);
    outerLayout.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

    LinearLayout linearLayout = new LinearLayout(context);
    linearLayout.setOrientation(LinearLayout.VERTICAL);
    linearLayout.setLayoutParams(new CoordinatorLayout.LayoutParams(CoordinatorLayout.LayoutParams.MATCH_PARENT, CoordinatorLayout.LayoutParams.MATCH_PARENT));

    DAOListViewBridge bridge = new DAOListViewBridge(context);
    bridge.X(X());
    View bridgeView = bridge.getView();
    bridgeView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT));

    FloatingActionButton fab = new FloatingActionButton(context);
    fab.setId(fabId);
    fab.setImageDrawable(new BitmapDrawable(getResources(), plusBitmap));

    CoordinatorLayout.LayoutParams lp = new CoordinatorLayout.LayoutParams(CoordinatorLayout.LayoutParams.WRAP_CONTENT, CoordinatorLayout.LayoutParams.WRAP_CONTENT);
    lp.setAnchorId(coordinatorId);
    lp.setMargins(0, 0, 12, 12);

    fab.setRippleColor(android.R.color.white);
    //fab.setBackgroundTintList(new
    */

    View view = decorateInflater(inflater).inflate(getInputInt("list_layout"), container, false);

    // TODO(braden): It would be good to eliminate the dependency on a couple of XML files for
    // this class, but that's not practical. The FAB can't be fully configured without XML!
    FloatingActionButton fab = (FloatingActionButton) view.findViewById(getInputInt("button_id"));
    fab.setOnClickListener(this);

    return view;
  }

  @Override
  public void onClick(View v) {
    DAO dao = (DAO) X().get("dao");
    Value<FObject> value = (Value<FObject>) X().getValue("selection");
    FObject newData = dao.getModel().newInstance();
    value.set(newData); // Triggers the fragment swap.
  }

  /*
  private static Bitmap makePlusBitmap() {
    final int dim = 32;
    final int thickness = 8;
    final int arms = 24;
    final int blank = (dim - thickness) / 2;
    final int armBlank = (dim - arms) / 2;

    Bitmap b = Bitmap.createBitmap(dim, dim, Bitmap.Config.ARGB_8888);

    for (int x = 0; x < dim; x++) {
      for (int y = 0; y < dim; y++) {
        if ((blank < x && x < dim - blank) ||
            (blank < y && y < dim - blank && armBlank < x && x < dim - armBlank)) {
          b.setPixel(x, y, Color.WHITE);
        } else {
          b.setPixel(x, y, Color.TRANSPARENT);
        }
      }
    }

    return b;
  }
  */
}
