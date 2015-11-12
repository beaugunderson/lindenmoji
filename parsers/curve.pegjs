@import "./emoji.pegjs" as Emoji

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
  / symbol:CommandSymbol '=' number:Number ';'?
  {
    var rule = {};

    rule[symbol] = number;

    return rule;
  }

// a command can have 0-n arguments, separated by commas
Arguments
  = first:Argument rest:RestArguments* {return [first].concat(rest)}

RestArguments
  = ',' a:Argument {return a}

// a command is a character followed by 0-n arguments; the join is to handle
// emojis which otherwise appear as two separate Unicode characters
Command
  = c:CommandSymbol a:Arguments?
  {return {command: c, args: a || []}}

// commands are upper- or lower-case letters or emoji
CommandSymbol
  = [a-z!@$%^&*_+()\[\]\{\}\<\>α-]i
  / Emoji

Fuzzy
  = "~"

VariationSelector
  = [\uFE0E\uFE0F]

// decimal numbers, we check for VariationSelector and the keycap since decimal
// numbers are a part of those emoji and we don't want to interpret them as
// arguments
Number
  = '-'?([0-9]+'.')?[0-9]+ ! VariationSelector ! '\u20E3'
  {return parseFloat(text(), 10)}

// strings enclosed in single or double quotes
String
  = "'"t:Text"'" {return t}
  / '"'t:Text'"' {return t}

Text
  = [a-z ]i* {return text()}

Argument
  = f:Fuzzy? m:Number {
      // unsure whether to do this here
      if (f) {
        m += 0.15;
      }

      return parseFloat(m, 10);
    }
  / String
