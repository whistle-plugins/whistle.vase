var CodeMirror = require('codemirror');
var props = 'req merge join out write render random header headers status statusCode json file get post reques'.split(' ');
// 'req req.method req.isHttps req.headers req.query req.body req.locals req.url';

CodeMirror.defineMode('vase', function(config, parserConfig) {
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

      if (props.indexOf(str) !== -1) {
        return 'built-in property';
      }
      return null;
    }
  };
  return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'text/javascript'), vaseOverlay);
});
