@import "./emoji.pegjs" as Emoji
@import "./argument.pegjs" as Argument
@import "./command.pegjs" as Command
@import "./command-symbol.pegjs" as CommandSymbol

start
  = initial:Initial ';' rules:Rule+
  {
    var bySymbol = {};

    rules.forEach(function (rule) {
      for (var key in rule) {
        if (rule.hasOwnProperty(key)) {
          bySymbol[key] = rule[key];
        }
      }
    });

    return {initial: initial, rules: bySymbol};
  }

Initial
  = Command+

Rule
  = symbol:CommandSymbol '=' commands:Command+ ';'?
  {
    var rule = {};

    rule[symbol] = commands;

    return rule;
  }
  / symbol:CommandSymbol '=' arguments:Argument+ ';'?
  {
    var rule = {};

    rule[symbol] = arguments;

    return rule;
  }
