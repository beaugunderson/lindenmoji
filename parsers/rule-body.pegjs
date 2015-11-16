@import "./command.pegjs" as Command

start
  = commands:Command*
  {
    var result = [];

    commands.forEach(function (command) {
      result.push([command.command, command.args].join(''));
    });

    return result;
  }
