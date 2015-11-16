@import "./emoji.pegjs" as Emoji

// commands are upper- or lower-case letters or emoji
CommandSymbol
  = [a-z!@$%^&*_+()\[\]\{\}\<\>α-]i
  / Emoji
