var CodeMirror = require('codemirror');
require('codemirror/addon/mode/overlay');

var reqProps = 'req.method req.isHttps req.headers req.query req.body req.locals req.url'.split(' ');
var builtins = 'merge join out write render random header headers status statusCode json file get post request req'
  .split(' ').concat(reqProps);

CodeMirror.registerHelper('hint', 'script', function(cm, options) {
  var cur = cm.getCursor();
  var token = cm.getTokenAt(cur);

  if (token.string === '.') {
    var end = cur.ch;
    var curLine = cm.getLine(cur.line);
    var start = end;

    while (--start > 0 ){
      var ch_ = curLine[start];
      if (/\s/.test(ch_) || ch_ === '(') {
        break;
      }
    }
    var word = curLine.slice(start, end-1);
    if (word === 'req') {
      return {
        list: reqProps.slice(0),
        from: CodeMirror.Pos(cur.line, start),
        to: cm.getCursor()
      };
    }
  }
  var list = builtins.filter(function(item){
    return item.indexOf(token.string) === 0;
  });
  return {
    list: list,
    from: CodeMirror.Pos(cur.line, token.start),
    to: cm.getCursor()
  };
});
CodeMirror.commands.autocomplete = function(cm) {
  cm.showHint({hint: CodeMirror.hint.script});
};

function completeAfter(cm, pred) {
  if (!pred || pred()) setTimeout(function() {
    if (!cm.state.completionActive) {
      cm.showHint({
        hint: CodeMirror.hint.script,
        completeSingle: false
      });
    }
  }, 100);
  return CodeMirror.Pass;
}

exports.extraKeys = (function() {
  var extraKeys = {'Alt-/': 'autocomplete'};
  var CHARS = ['\'.\''];
  for (var a = 'a'.charCodeAt(), z = 'z'.charCodeAt(); a <= z; a++) {
    var ch = String.fromCharCode(a);
    CHARS.push('\'' + ch.toUpperCase() + '\'');
    CHARS.push('\'' + ch + '\'');
  }
  CHARS.forEach(function(ch) {
    extraKeys[ch] = completeAfter;
  });
  return extraKeys;
})();

exports.builtins = builtins;
