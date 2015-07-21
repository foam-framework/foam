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
import foam.tutorials.todo.R;


/**
 * A placeholder fragment containing a simple view.
 */
public class ListFragment extends FOAMFragment implements View.OnClickListener {
  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container,
                           Bundle savedInstanceState) {
    X x = findX(container.getContext());
    if (x == null) return null;
    X(x.put("data", x.get("dao")));

    container.removeAllViews();
    View view = decorateInflater(inflater).inflate(R.layout.fragment_main, container, false);

    // TODO(braden): It would be good to eliminate the dependency on a couple of XML files for
    // this class, but that's not practical. The FAB can't be fully configured without XML!
    FloatingActionButton fab = (FloatingActionButton) view.findViewById(R.id.create_button);
    fab.setOnClickListener(this);

    return view;
  }

  @Override
  public void onClick(View v) {
    DAO dao = (DAO) X().get("dao");
    Value<FObject> value = (Value<FObject>) X().get("selection");
    FObject newData = dao.getModel().newInstance();
    value.set(newData); // Triggers the fragment swap.
  }
}
