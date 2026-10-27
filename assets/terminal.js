(function () {
  'use strict';

  var LINKEDIN = 'https://www.linkedin.com/in/stefan-mehnert-40a58489/';
  var LINKEDIN_SHORT = 'linkedin.com/in/stefan-mehnert-40a58489';
  var START = Date.now();
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var root = document.documentElement;
  var termEl = document.getElementById('term');
  var outEl = document.getElementById('output');
  var chipsEl = document.getElementById('chips');

  var lang = (navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  var history = [];
  var historyPos = 0;
  var busy = false;

  // Ausgabezeilen sind Listen von Segmenten: 'text' oder {t, c, href}
  var TEXT = {
    en: {
      motd: [
        ['Welcome. This used to be a blog. Now it is a business card with a shell.'],
        ['Type ', { t: 'help', c: 'accent' }, ' to look around, or ', { t: 'linkedin', c: 'accent' }, ' to get to the point.']
      ],
      whoami: [['Head of Software Development @Polipol - more on ', { t: 'LinkedIn', href: LINKEDIN }]],
      help: {
        help: 'show this list',
        whoami: 'who lives here',
        linkedin: 'open my LinkedIn profile',
        ls: 'list files',
        'cat <file>': 'print a file',
        fetch: 'system info (yours, computed locally)',
        'theme <dark|light>': 'switch colors',
        'lang <de|en>': 'Sprache / language',
        history: 'command history',
        clear: 'clear the screen',
        impressum: 'legal notice (German)',
        datenschutz: 'privacy policy (German)'
      },
      helpFoot: '// there are a few more. curiosity is a feature.',
      readme: [
        ['This is not a blog. Not anymore.'],
        ['It is a business card that happens to run a shell.'],
        ['No cookies, no tracking, no build step. Just HTML, CSS and a bit of JavaScript.']
      ],
      opening: 'opening ',
      notFound: function (c) { return 'bash: ' + c + ': command not found. type help.'; },
      noFile: function (f) { return 'cat: ' + f + ': No such file or directory'; },
      noCatArg: 'cat: missing file operand. try ls.',
      denied: function (f) { return 'cat: ' + f + ': Permission denied'; },
      noDir: function (d) { return 'bash: cd: ' + d + ': No such file or directory'; },
      sudo: 'guest is not in the sudoers file. This incident will be reported.',
      rmRoot: ['rm: it is dangerous to operate recursively on \'/\'', 'rm: use --no-preserve-root to override this failsafe'],
      rmNice: 'nice try.',
      rmRo: function (f) { return 'rm: cannot remove \'' + f + '\': Read-only file system'; },
      exit: ['logout', '...there is no escape. try linkedin.'],
      vim: 'vim: nothing to edit. good, you would never get out anyway.',
      emacs: 'emacs: nice operating system, lacks a decent editor. try vim.',
      man: 'What manual page do you want?',
      manNone: function (p) { return 'No manual entry for ' + p; },
      themeNow: function (v) { return 'theme: ' + v; },
      themeUsage: 'usage: theme <dark|light>',
      langSet: 'language: english',
      langUsage: 'usage: lang <de|en>',
      fetch: { os: 'os', browser: 'browser', screen: 'screen', viewport: 'viewport', lang: 'language', theme: 'theme', uptime: 'uptime', host: 'host', note: '// all values come from your browser and stay there.' }
    },
    de: {
      motd: [
        ['Willkommen. Hier war mal ein Blog. Jetzt ist es eine Visitenkarte mit Shell.'],
        ['Tippe ', { t: 'help', c: 'accent' }, ', um dich umzusehen, oder ', { t: 'linkedin', c: 'accent' }, ', um zur Sache zu kommen.']
      ],
      whoami: [['Leiter Softwareentwicklung @Polipol - mehr auf ', { t: 'LinkedIn', href: LINKEDIN }]],
      help: {
        help: 'diese Liste',
        whoami: 'wer hier wohnt',
        linkedin: 'mein LinkedIn-Profil öffnen',
        ls: 'Dateien auflisten',
        'cat <datei>': 'Datei ausgeben',
        fetch: 'Systeminfo (deine, lokal ermittelt)',
        'theme <dark|light>': 'Farben wechseln',
        'lang <de|en>': 'Sprache / language',
        history: 'Befehlsverlauf',
        clear: 'Bildschirm leeren',
        impressum: 'Impressum',
        datenschutz: 'Datenschutzerklärung'
      },
      helpFoot: '// es gibt noch ein paar mehr. Neugier ist ein Feature.',
      readme: [
        ['Das ist kein Blog. Nicht mehr.'],
        ['Es ist eine Visitenkarte, die zufällig eine Shell hat.'],
        ['Keine Cookies, kein Tracking, kein Build-Schritt. Nur HTML, CSS und etwas JavaScript.']
      ],
      opening: 'öffne ',
      notFound: function (c) { return 'bash: ' + c + ': Befehl nicht gefunden. Tippe help.'; },
      noFile: function (f) { return 'cat: ' + f + ': Datei oder Verzeichnis nicht gefunden'; },
      noCatArg: 'cat: Dateioperand fehlt. Versuch ls.',
      denied: function (f) { return 'cat: ' + f + ': Keine Berechtigung'; },
      noDir: function (d) { return 'bash: cd: ' + d + ': Datei oder Verzeichnis nicht gefunden'; },
      sudo: 'guest ist nicht in der sudoers-Datei. Dieser Vorfall wird gemeldet.',
      rmRoot: ['rm: es ist gefährlich, rekursiv auf »/« zu arbeiten', 'rm: benutzen Sie --no-preserve-root, um diese Schutzmaßnahme zu umgehen'],
      rmNice: 'netter Versuch.',
      rmRo: function (f) { return 'rm: das Entfernen von \'' + f + '\' ist nicht möglich: Dateisystem ist nur lesbar'; },
      exit: ['logout', '...es gibt kein Entkommen. Versuch linkedin.'],
      vim: 'vim: nichts zu bearbeiten. Gut so, du kämst eh nicht mehr raus.',
      emacs: 'emacs: tolles Betriebssystem, nur der Editor fehlt. Versuch vim.',
      man: 'Welche Handbuchseite wollen Sie haben?',
      manNone: function (p) { return 'Kein Handbucheintrag für ' + p + ' vorhanden'; },
      themeNow: function (v) { return 'theme: ' + v; },
      themeUsage: 'Aufruf: theme <dark|light>',
      langSet: 'Sprache: deutsch',
      langUsage: 'Aufruf: lang <de|en>',
      fetch: { os: 'os', browser: 'browser', screen: 'bildschirm', viewport: 'fenster', lang: 'sprache', theme: 'theme', uptime: 'uptime', host: 'host', note: '// alle Werte stammen aus deinem Browser und bleiben dort.' }
    }
  };

  function t(key) { return TEXT[lang][key]; }

  var FILES = { 'README.md': true, 'linkedin.url': true, '.secrets': true };
  var COMMANDS = ['help', 'whoami', 'linkedin', 'contact', 'ls', 'cat', 'fetch', 'neofetch', 'theme', 'lang', 'history', 'clear',
    'impressum', 'datenschutz', 'privacy', 'date', 'pwd', 'echo', 'cd', 'uname', 'man', 'sudo', 'rm', 'exit', 'vim', 'vi', 'nano', 'emacs'];

  // ---------- Ausgabe ----------

  function seg(s) {
    if (typeof s === 'string') return document.createTextNode(s);
    var el;
    if (s.href) {
      el = document.createElement('a');
      el.href = s.href;
      if (/^https?:/.test(s.href)) { el.target = '_blank'; el.rel = 'noopener'; }
    } else {
      el = document.createElement('span');
    }
    if (s.c) el.className = s.c;
    el.textContent = s.t;
    return el;
  }

  function print(parts, cls) {
    var line = document.createElement('div');
    line.className = 'line' + (cls ? ' ' + cls : '');
    (Array.isArray(parts) ? parts : [parts]).forEach(function (p) { line.appendChild(seg(p)); });
    outEl.appendChild(line);
    scrollDown();
    return line;
  }

  function printLines(lines, cls) { lines.forEach(function (l) { print(l, cls); }); }

  function promptParts() {
    return [{ t: 'guest@stefan-mehnert', c: 'prompt-user' }, ':', { t: '~', c: 'prompt-path' }, '$ '];
  }

  function scrollDown() { termEl.scrollTop = termEl.scrollHeight; }

  // ---------- Eingabezeile ----------

  var inputLine = document.createElement('div');
  inputLine.className = 'line input-line';
  promptParts().forEach(function (p) { inputLine.appendChild(seg(p)); });
  var wrap = document.createElement('span');
  wrap.className = 'input-wrap';
  var input = document.createElement('input');
  input.className = 'term-input';
  input.type = 'text';
  input.setAttribute('aria-label', 'command');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('enterkeyhint', 'send');
  var mirror = document.createElement('span');
  mirror.className = 'input-mirror';
  mirror.setAttribute('aria-hidden', 'true');
  wrap.appendChild(input);
  wrap.appendChild(mirror);
  inputLine.appendChild(wrap);

  function renderMirror() {
    var v = input.value;
    var pos = input.selectionStart == null ? v.length : input.selectionStart;
    mirror.textContent = '';
    mirror.appendChild(document.createTextNode(v.slice(0, pos)));
    var cur = document.createElement('span');
    cur.className = 'cursor';
    cur.textContent = v.charAt(pos) || ' ';
    mirror.appendChild(cur);
    mirror.appendChild(document.createTextNode(v.slice(pos + 1)));
  }

  function showInput() {
    outEl.appendChild(inputLine);
    input.value = '';
    renderMirror();
    if (refocus) input.focus({ preventScroll: true });
    scrollDown();
  }

  // Beim Umhängen der Zeile geht der Fokus verloren, deshalb merken
  var refocus = false;

  function hideInput() {
    refocus = document.activeElement === input;
    if (inputLine.parentNode) inputLine.parentNode.removeChild(inputLine);
  }

  ['input', 'keyup', 'click', 'select', 'focus', 'blur'].forEach(function (ev) {
    input.addEventListener(ev, renderMirror);
  });

  input.addEventListener('keydown', function (e) {
    if (busy) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyPos > 0) { historyPos--; setInput(history[historyPos]); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPos < history.length) { historyPos++; setInput(history[historyPos] || ''); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      clear();
      showInput();
      input.focus();
    } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection().toString()) {
      e.preventDefault();
      hideInput();
      print(promptParts().concat([input.value, { t: '^C', c: 'faint' }]));
      showInput();
    }
  });

  function setInput(v) {
    input.value = v;
    input.setSelectionRange(v.length, v.length);
    renderMirror();
  }

  function complete() {
    var v = input.value;
    var parts = v.split(' ');
    var pool;
    if (parts.length === 1) pool = COMMANDS;
    else if (parts[0] === 'cat' || parts[0] === 'rm') pool = Object.keys(FILES);
    else if (parts[0] === 'theme') pool = ['dark', 'light'];
    else if (parts[0] === 'lang') pool = ['de', 'en'];
    else return;
    var last = parts[parts.length - 1];
    var hits = pool.filter(function (c) { return c.indexOf(last) === 0; });
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      setInput(parts.join(' ') + (parts.length === 1 ? ' ' : ''));
    } else if (hits.length > 1) {
      hideInput();
      print(promptParts().concat([v]));
      print(hits.join('  '), 'muted');
      showInput();
      setInput(v);
    }
  }

  // ---------- Befehle ----------

  function submit(raw) {
    var cmd = raw.trim();
    hideInput();
    print(promptParts().concat([raw]));
    if (cmd) {
      history.push(cmd);
      run(cmd);
    }
    historyPos = history.length;
    showInput();
  }

  function run(cmd) {
    var args = cmd.split(/\s+/);
    var name = args.shift();
    var handler = HANDLERS[name];
    if (handler) handler(args, cmd);
    else print(t('notFound')(name), 'danger');
  }

  function openLinkedIn() {
    print([t('opening'), { t: LINKEDIN_SHORT, href: LINKEDIN }, ' …']);
    window.open(LINKEDIN, '_blank', 'noopener');
  }

  function go(page) {
    print([t('opening'), { t: page, href: page }, ' …']);
    window.setTimeout(function () { window.location.href = page; }, REDUCED_MOTION ? 0 : 400);
  }

  function setTheme(v) {
    root.setAttribute('data-theme', v);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', v === 'light' ? '#f6f6f3' : '#0e1013');
  }

  function clear() { outEl.textContent = ''; }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function isoNow() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function detectOs() {
    var ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'unknown';
  }

  function detectBrowser() {
    var ua = navigator.userAgent;
    var m;
    if ((m = ua.match(/Edg\/(\d+)/))) return 'Edge ' + m[1];
    if ((m = ua.match(/OPR\/(\d+)/))) return 'Opera ' + m[1];
    if ((m = ua.match(/Firefox\/(\d+)/))) return 'Firefox ' + m[1];
    if ((m = ua.match(/Chrome\/(\d+)/))) return 'Chrome ' + m[1];
    if ((m = ua.match(/Version\/(\d+).*Safari/))) return 'Safari ' + m[1];
    return 'unknown';
  }

  function uptime() {
    var s = Math.floor((Date.now() - START) / 1000);
    var m = Math.floor(s / 60);
    return (m ? m + 'm ' : '') + (s % 60) + 's';
  }

  function fetchInfo() {
    var L = t('fetch');
    var art = [
      ' ##          ',
      '   ##        ',
      '     ##      ',
      '   ##        ',
      ' ##   ###### ',
      '             ',
      '             ',
      '             ',
      '             ',
      '             '
    ];
    var info = [
      [{ t: 'guest', c: 'accent bold' }, '@', { t: 'stefan-mehnert', c: 'accent bold' }],
      [{ t: '--------------------', c: 'faint' }],
      [{ t: L.os, c: 'info' }, ': ' + detectOs()],
      [{ t: L.browser, c: 'info' }, ': ' + detectBrowser()],
      [{ t: L.screen, c: 'info' }, ': ' + screen.width + 'x' + screen.height],
      [{ t: L.viewport, c: 'info' }, ': ' + window.innerWidth + 'x' + window.innerHeight],
      [{ t: L.lang, c: 'info' }, ': ' + (navigator.language || 'unknown')],
      [{ t: L.theme, c: 'info' }, ': ' + root.getAttribute('data-theme')],
      [{ t: L.uptime, c: 'info' }, ': ' + uptime()],
      [{ t: L.host, c: 'info' }, ': GitHub Pages']
    ];
    for (var i = 0; i < info.length; i++) {
      print([{ t: art[i], c: 'accent' }].concat(info[i]));
    }
    print(t('fetch').note, 'faint');
  }

  var HANDLERS = {
    help: function () {
      var h = t('help');
      Object.keys(h).forEach(function (k) {
        var label = (k + '                    ').slice(0, 20);
        print([{ t: label, c: 'accent' }, h[k]]);
      });
      print(t('helpFoot'), 'faint');
    },
    whoami: function () { printLines(t('whoami')); },
    linkedin: openLinkedIn,
    contact: openLinkedIn,
    ls: function (args) {
      var all = args.some(function (a) { return /^-\w*a/.test(a); });
      var out = [{ t: 'README.md', c: '' }, '  ', { t: 'linkedin.url', c: 'info' }];
      if (all) out = [{ t: '.', c: 'info' }, '  ', { t: '..', c: 'info' }, '  ', { t: '.secrets', c: 'faint' }, '  '].concat(out);
      print(out);
    },
    cat: function (args) {
      if (!args.length) { print(t('noCatArg'), 'danger'); return; }
      args.forEach(function (f) {
        if (f === 'README.md') printLines(t('readme'));
        else if (f === 'linkedin.url') print({ t: LINKEDIN, href: LINKEDIN });
        else if (f === '.secrets') print(t('denied')(f), 'danger');
        else print(t('noFile')(f), 'danger');
      });
    },
    fetch: fetchInfo,
    neofetch: fetchInfo,
    theme: function (args) {
      var v = args[0];
      if (v === 'dark' || v === 'light') { setTheme(v); print(t('themeNow')(v), 'muted'); }
      else if (!v) print(t('themeNow')(root.getAttribute('data-theme')), 'muted');
      else print(t('themeUsage'), 'danger');
    },
    lang: function (args) {
      var v = args[0];
      if (v === 'de' || v === 'en') { lang = v; root.setAttribute('lang', v); print(t('langSet'), 'muted'); }
      else print(t('langUsage'), v ? 'danger' : 'muted');
    },
    history: function () {
      history.forEach(function (h, i) { print([{ t: ('   ' + (i + 1)).slice(-4) + '  ', c: 'faint' }, h]); });
    },
    clear: clear,
    impressum: function () { go('impressum.html'); },
    datenschutz: function () { go('datenschutz.html'); },
    privacy: function () { go('datenschutz.html'); },
    date: function () { print(isoNow()); },
    pwd: function () { print('/home/guest'); },
    echo: function (args, raw) { print(raw.replace(/^echo\s?/, '')); },
    cd: function (args) {
      var d = args[0];
      if (!d || d === '~' || d === '/home/guest' || d === '.') return;
      print(t('noDir')(d), 'danger');
    },
    uname: function (args) {
      print(args.indexOf('-a') >= 0 ? 'HTML5 stefan-mehnert 1.0 static GitHub-Pages' : 'HTML5');
    },
    man: function (args) { print(args.length ? t('manNone')(args[0]) : t('man')); },
    sudo: function () { print(t('sudo'), 'danger'); },
    rm: function (args) {
      var rec = args.some(function (a) { return /^-\w*r/i.test(a); });
      var target = args.filter(function (a) { return a.charAt(0) !== '-'; })[0];
      if (rec && target === '/') {
        if (args.indexOf('--no-preserve-root') >= 0) print(t('rmNice'), 'amber');
        else printLines(t('rmRoot'), 'danger');
      } else {
        print(t('rmRo')(target || '?'), 'danger');
      }
    },
    exit: function () { printLines(t('exit'), 'muted'); },
    vim: function () { print(t('vim'), 'muted'); },
    vi: function () { print(t('vim'), 'muted'); },
    nano: function () { print(t('vim'), 'muted'); },
    emacs: function () { print(t('emacs'), 'muted'); }
  };

  // ---------- Boot ----------

  var skip = false;

  function sleep(ms) {
    return new Promise(function (res) { window.setTimeout(res, skip ? 0 : ms); });
  }

  function typeCommand(text) {
    var line = print(promptParts());
    var node = document.createTextNode('');
    line.appendChild(node);
    var i = 0;
    return new Promise(function (res) {
      (function step() {
        if (skip || i >= text.length) { node.data = text; res(); return; }
        node.data = text.slice(0, ++i);
        window.setTimeout(step, 55 + Math.random() * 60);
      })();
    });
  }

  function skipBoot() { skip = true; }

  function boot() {
    if (REDUCED_MOTION) skip = true;
    busy = true;
    window.addEventListener('keydown', skipBoot, { once: true });
    termEl.addEventListener('pointerdown', skipBoot, { once: true });

    return sleep(400)
      .then(function () { return typeCommand('whoami'); })
      .then(function () { return sleep(200); })
      .then(function () { printLines(t('whoami')); return sleep(500); })
      .then(function () { return typeCommand('cat motd'); })
      .then(function () { return sleep(200); })
      .then(function () {
        printLines(t('motd'), 'muted');
        busy = false;
        window.removeEventListener('keydown', skipBoot);
        termEl.removeEventListener('pointerdown', skipBoot);
        showInput();
        if (window.matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
      });
  }

  // ---------- Chips und Fokus ----------

  ['help', 'whoami', 'linkedin', 'fetch', 'ls'].forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = c;
    b.addEventListener('click', function () {
      if (busy) return;
      submit(c);
    });
    chipsEl.appendChild(b);
  });
  chipsEl.hidden = false;

  termEl.addEventListener('click', function (e) {
    if (busy || e.target.closest('a')) return;
    if (window.getSelection().toString()) return;
    input.focus({ preventScroll: true });
  });

  root.setAttribute('lang', lang);
  boot();
})();
