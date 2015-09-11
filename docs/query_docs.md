# Query Syntax

This document describes the supported query syntax. It is essentially the
same query language supported by eg. Gmail.

Syntax | Meaning
--- | ---
`key:value` |                  Key contains "value"
`key=value` |                  Key exactly matches "value"
`key:value1,value2` |          Key contains "value1" OR "value2"
`key:(value1|value2)` |        As above
`key1:value key2:value` |      Key1 contains "value" AND key2 contains "value"
`key1:value AND key2:value` |  As above
`key1:value and key2:value` |  As above
`key1:value OR key2:value` |   Key1 contains value OR key2 contains "value"
`key1:value or key2:value` |   As above
`key:(-value)` |               Key does not contain "value"
`(expr)` |                     Provides grouping.
`-expr` |                      Negates expression, ie. `-pri:1`
`NOT expr` |                   Negates expression, ie. `NOT pri:1`
`has:key` |                    Key has some value
`is:key` |                     Key is a boolean TRUE value
`key>value` |                  Key is greater than value
`key-after:value` |            As above
`key<value` |                  Key is less than value
`key-before:value` |           As above
`date:YY/MM/DD` |              Date specified
`date:today` |                 Date of today
`date-after:today-7` |         Date newer than 7 days ago
`date:d1..d2` |                Date within range d1 to d2, inclusive

## Date Formats

* `YYYY`
* `YYYY-MM`
* `YYYY-MM-DD`
* `YYYY-MM-DDTHH` (T is a literal, eg. `2015-09-20T14`
* `YYYY-MM-DDTHH:MM`

