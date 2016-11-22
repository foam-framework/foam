package foam.lib.json;

import java.util.HashMap;
import java.util.List;
import java.util.LinkedList;
import java.util.Iterator;

import java.lang.reflect.InvocationTargetException;

import foam.core.Model;
import foam.core.Property;
import foam.lib.parse.*;

public class ModelParserFactory {
  private static HashMap<Model, Parser> parsers_ = new HashMap<>();

  public static Parser getInstance(Model m) {
    if ( parsers_.containsKey(m) ) {
      return parsers_.get(m);
    }

    Parser parser = buildInstance_(m);
    parsers_.put(m, parser);
    return parser;
  }

  public static Parser buildInstance_(Model info) {
    List<Property> properties = info.getProperties();

    Parser[] propertyParsers = new Parser[properties.size()];

    Iterator<Property> iter = properties.iterator();
    int i = 0;
    while(iter.hasNext()) {
      propertyParsers[i] = new PropertyParser(iter.next());
      i++;
    }

    // TODO: Don't fail to parse if we find an unknown property.

    return new Repeat0(new Seq0(new Whitespace(),
                                new Literal(","),
                                new Whitespace(),
                                new Alt(propertyParsers)));
  }
}
