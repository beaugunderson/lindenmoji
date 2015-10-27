start
  = initial:Initial ';' rules:Rule+
  {
    var byLetter = {};

    rules.forEach(function (rule) {
      for (var key in rule) {
        if (rule.hasOwnProperty(key)) {
          byLetter[key] = rule[key];
        }
      }
    });

    return {initial: initial, rules: byLetter};
  }

Initial
  = Command+

Rule
  = letter:CommandLetter '=' commands:Command+ ';'?
  {
    var rule = {};

    rule[letter] = commands;

    return rule;
  }
  / letter:CommandLetter '=' number:Number ';'?
  {
    var rule = {};

    rule[letter] = number;

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
  = c:CommandLetter a:Arguments?
  {return {command: c, args: a || []}}

// commands are upper- or lower-case letters or emoji
CommandLetter
  = [a-z!@$%^&*_+()\[\]\{\}\<\>α-]i
  / Emoji

Emoji
  = p:PhoneButton
  / e:EmojiCharacter v:VariationSelector? {
    return (e.join ? e.join('') : e) + (v ? v.join ? v.join('') : v : '')
  }

PhoneButton
  = [0-9#*] VariationSelector? '\u20E3' {return text()}

EmojiCharacter
  = [\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]
  / [\uD83C][\uDC04-\uDFFF]
  / [\uD83D][\uDC00-\uDE4F]
  / [\uD83D][\uDE80-\uDEC5]
  / [\u203C-\u3299]
  / '\u24C2'
  / [\u2702-\u27B0]
  / [\u00A9\u00AE]

VariationSelector
  = [\uFE0E\uFE0F]

Fuzzy
  = "~"

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
