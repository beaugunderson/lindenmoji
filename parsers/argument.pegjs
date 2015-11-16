Argument
  = f:Fuzzy? m:Number {
      // unsure whether to do this here
      if (f) {
        m += 0.15;
      }

      return parseFloat(m, 10);
    }
  / String

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
