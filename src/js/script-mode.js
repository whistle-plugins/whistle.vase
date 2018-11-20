var CodeMirror = require('codemirror');
var builtins = require('./script-hint').builtins;

CodeMirror.defineMode('script', function(config, parserConfig) {
  require('codemirror/addon/mode/overlay');

  var vaseOverlay = {
    token: function(stream, state) {
      if (stream.eatSpace()) {
        return null;
      }
      var leftBracket = stream.eatWhile(function(ch) {
        return '(' === ch;
      });
      if(leftBracket) {
        return null;
      }
      var str = stream.next();
      stream.eatWhile(function(ch) {
        if (/\s/.test(ch) || ch === '(' || ch === '.') {
          return false;
        }
        str = str + ch;
        return true;
      });
      if (builtins.indexOf(str) !== -1) {
        return 'built-in property';
      }
      return null;
    }
  };
  return CodeMirror.overlayMode(CodeMirror.getMode(config, 'text/javascript'), vaseOverlay);
});
