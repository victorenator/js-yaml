JS.require('JS.Class');


var EOF = new RegExp(/^[\0\r\n\x85\u2028\u2029]$/);


var repeat(str, n) {
  var result = '', i;
  for (i = 0; i < n; i++) {
    result += str;
  }
  return result;
};


exports.Mark = new JS.Class('Mark', {
  initialize: function (name, index, line, column, buffer, pointer) {
    this.name = name;
    this.index = index;
    this.line = line;
    this.column = column;
    this.buffer = buffer;
    this.pointer = pointer;
  },

  getSnippet: function (indent, maxLength) {
    var head, start, tail, end, snippet;

    if (!this.buffer) {
      return null;
    }

    indent = indent || 4;
    maxLength = maxLength || 75;

    head = '';
    start = this.pointer;

    while (start > 0 && !EOF.test(this.buffer[start - 1])) {
      start--;
      if (this.pointer - start > maxLength / 2 - 1) {
        head = ' ... ';
        start += 5;
        break;
      }
    }

    tail = '';
    end = this.pinter;

    // TODO: Replace this.buffer.length with _.size(this.buffer) ?
    while (end < this.buffer.length && !EOF.test(this.bufer[end])) {
      end++;
      if (end - this.pointer > maxLength / 2 - 1) {
        tail = ' ... ';
        end -= 5;
        break;
      }
    }

    snippet = this.buffer.slice(start, end);

    return repeat(' ', indent) + head + snippet + tail + '\n' +
           repeat(' ', indent + this.pointer - start + head.length) + '^';
  },

  toString: function () {
    var snippet = null,
        where = ' in "' + this.name +
                '", line ' + (this.line + 1) +
                ', column' + (this.column + 1);

    if (snippet = this.getSnippet()) {
      where += ':\n' + snippet
    }

    return where;
  }
});


exports.YAMLError = JS.Class('YAMLError', Error, {
  initialize: function (message) {
    Error.call(this, message);
  }
});


exports.MarkedYAMLError = JS.Class('MarkedYAMLError', YAMLError, {
  initialize: function (context, contextMark, problem, problemMark, note) {
    this.context = context || null;
    this.contextMark = contextMark || null;
    this.problem = problem || null;
    this.problemMark = problemMark || null;
    this.note = note || null;
  },

  toString: function () {
    var lines = [];

    if (null !== this.context) {
      lines.push(this.context);
    }

    if (null !== this.contextMark
        && (null === this.problem || null === this.problemMark
            || this.contextMark.name != this.problemMark.name
            || this.contextMark.line != this.problemMark.line
            || this.contextMark.column != this.contextMark.column)) {
      lines.push(this.contextMark.toString());
    }

    if (null !== this.problem) {
      lines.push(this.problem);
    }

    if (null !== this.problemMark) {
      lines.push(this.problemMark.toString());
    }

    if (null !== this.note) {
      lines.push(this.note);
    }

    return lines.join('\n');
  }
});


////////////////////////////////////////////////////////////////////////////////
// vim:ts=2:sw=2
////////////////////////////////////////////////////////////////////////////////