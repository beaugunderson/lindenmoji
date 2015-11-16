@import "./argument.pegjs" as Argument

// a command can have 0-n arguments, separated by commas
Arguments
  = first:Argument rest:RestArguments* {return [first].concat(rest)}

RestArguments
  = ',' a:Argument {return a}
