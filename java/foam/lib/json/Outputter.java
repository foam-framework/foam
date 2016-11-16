package foam.lib.json;

import foam.core.Model;
import foam.core.Property;
import foam.core2.FObject;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class Outputter {
  public String stringify(FObject obj) {
    StringBuilder sb = new StringBuilder();
    outputFObject(sb, obj);
    return sb.toString();
  }

  protected void outputString(StringBuilder out, String s) {
    out.append("\"");
    out.append(escape(s));
    out.append("\"");
  }

  public String escape(String s) {
    return s.replace("\"", "\\\"");
  }

  protected void outputNumber(StringBuilder out, Number value) {
    out.append(value.toString());
  }

  protected void outputEnum(StringBuilder out, Enum value) {
    out.append(value.ordinal());
  }

  protected void outputBoolean(StringBuilder out, Boolean value) {
    if ( value ) out.append("true");
    else out.append("false");
  }

  protected void outputDate(StringBuilder out, Date date) {
    out.append(date.getTime());
  }

  protected void outputArray(StringBuilder out, Object[] array) {
    out.append("[");
    for ( int i = 0 ; i < array.length ; i++ ) {
      output(out, array[i]);
      if ( i < array.length - 1 ) out.append(",");
    }
    out.append("]");
  }

  protected void outputProperty(StringBuilder out, FObject o, Property p) {
    out.append(beforeKey_());
    out.append(p.getName());
    out.append(afterKey_());
    out.append(":");
    p.getJavaOutputJson().call(this, out, o.get(p.getName()));
  }

  public void output(StringBuilder out, Object value) {
    if ( value instanceof String ) {
      outputString(out, (String)value);
    } else if ( value instanceof FObject ) {
      outputFObject(out, (FObject)value);
    } else if ( value instanceof Number ) {
      outputNumber(out, (Number)value);
    } else if ( value instanceof Date ) {
      outputDate(out, (Date)value);
    } else if ( value instanceof List ) {
      output(out, ((List)value).toArray());
    } else if ( value.getClass().isArray() ) {
      outputArray(out, (Object[])value);
    } else if ( value instanceof Boolean ) {
      outputBoolean(out, (Boolean)value);
    } else if ( value instanceof Enum ) {
      outputEnum(out, (Enum)value);
    } else {
      out.append(0);
    }
  }

  protected void outputFObject(StringBuilder out, FObject o) {
    Model info = o.getModel_();
    out.append("{");
    out.append(beforeKey_());
    out.append("class");
    out.append(afterKey_());
    out.append(":");

    StringBuilder id = new StringBuilder();
    if (info.getPackage().length() > 0) {
      id.append(info.getPackage());
      id.append(".");
    }
    id.append(info.getName());
    outputString(out, id.toString());

    List<Property> axioms = info.getProperties();
    Iterator<Property> i = axioms.iterator();

    while ( i.hasNext() ) {
      Property prop = i.next();
      if ( prop.getTransient() ) continue;

      if ( !o.hasOwnProperty(prop.getName()) ) continue;

      out.append(",");
      outputProperty(out, o, prop);
    }

    out.append("}");
  }

  protected String beforeKey_() {
    return "\"";
  }

  protected String afterKey_() {
    return "\"";
  }
}
