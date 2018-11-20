var CodeMirror = require('codemirror');
require('codemirror/addon/mode/overlay');

var reqProps = 'req.method req.isHttps req.headers req.query req.body req.locals req.url'.split(' ');
var bultins = 'req merge join out write render random header headers status statusCode json file get post request'
  .split(' ').concat(reqProps);

CodeMirror.registerHelper('hint', 'script', function(cm, options) {
  var javascriptHint = CodeMirror.hint.javascript;
  var inner = javascriptHint(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
  var cur = cm.getCursor();
  var token = cm.getTokenAt(cur);
  var additions = [];

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
    var w = curLine.slice(start, end-1);
    if (w === 'req') {
      additions = reqProps.slice(0);
      inner.list = additions.concat(inner.list);
      inner.from.ch = inner.from.ch - 4;
      return inner;
    }
  }
  additions = bultins.filter(function(item){
    return item.indexOf(token.string) === 0;
  });
  inner.list = additions.concat(inner.list);
  return inner;
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
