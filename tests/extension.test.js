const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function background(executeScript = async () => {}) {
  const listeners = {};
  const menus = [];
  const injections = [];
  const badges = [];
  const errors = [];
  const chrome = {
    runtime: {onInstalled: {addListener: listener => { listeners.installed = listener; }}},
    contextMenus: {
      removeAll: callback => { menus.length = 0; callback(); },
      create: (menu, callback) => { menus.push(plain(menu)); callback(); },
      onClicked: {addListener: listener => { listeners.clicked = listener; }}
    },
    scripting: {
      executeScript: injection => {
        injections.push(injection);
        return executeScript(injection);
      }
    },
    action: {
      setBadgeText: async badge => { badges.push(plain(badge)); },
      setTitle: async () => {}
    }
  };
  const context = vm.createContext({
    chrome,
    console: {error: (...args) => { errors.push(args); }},
    importScripts: () => vm.runInContext(source('inject/inject.js'), context)
  });
  vm.runInContext(source('src/bg/background.js'), context);
  return {listeners, menus, injections, badges, errors};
}

test('service worker installs unique menus without recreating them on startup', () => {
  const app = background();
  assert.equal(app.menus.length, 0);
  assert.equal(typeof app.listeners.clicked, 'function');
  app.listeners.installed();
  app.listeners.installed();
  assert.deepEqual(app.menus.map(menu => menu.id), ['qrify-selection', 'qrify-page']);
  assert.ok(app.menus.every(menu => !('onclick' in menu)));
});

test('concurrent selections keep their own data and target the clicked tab', async () => {
  const pending = new Map();
  const app = background(injection => {
    if (!injection.files) return Promise.resolve();
    return new Promise(resolve => { pending.set(injection.target.tabId, resolve); });
  });
  const first = app.listeners.clicked(
    {menuItemId: 'qrify-selection', selectionText: 'a'.repeat(700)}, {id: 1}
  );
  const second = app.listeners.clicked(
    {menuItemId: 'qrify-selection', selectionText: 'other tab'}, {id: 2}
  );
  assert.equal(app.injections.length, 2);
  pending.get(2)();
  await second;
  pending.get(1)();
  await first;
  const renders = app.injections.filter(injection => injection.func);
  assert.deepEqual(plain(renders.map(({target, args}) => ({target, args}))), [
    {target: {tabId: 2}, args: ['other tab']},
    {target: {tabId: 1}, args: ['a'.repeat(500)]}
  ]);
  assert.ok(renders.every(injection => injection.func.name === 'showQRCode'));
  assert.deepEqual(plain(app.injections[0].files), ['js/qr-code.js']);
});

test('link takes precedence over selection, while page action keeps the full URL', async () => {
  const app = background();
  const url = 'https://example.com/' + 'a'.repeat(700);
  await app.listeners.clicked(
    {menuItemId: 'qrify-selection', selectionText: 'selected', linkUrl: url},
    {id: 3, url: 'https://other.example/'}
  );
  assert.equal(app.injections[1].args[0], 'https://example.com');
  await app.listeners.clicked(
    {menuItemId: 'qrify-page', selectionText: 'ignored', linkUrl: 'https://ignored.example/'},
    {id: 3, url}
  );
  assert.equal(app.injections[3].args[0], url);
});

test('failed injection is reported instead of showing a successful result', async () => {
  const app = background(async () => { throw new Error('Cannot access a chrome:// URL'); });
  await app.listeners.clicked({menuItemId: 'qrify-page'}, {id: 4, url: 'chrome://extensions/'});
  assert.equal(app.injections.length, 1);
  assert.equal(app.errors.length, 1);
  assert.deepEqual(app.badges, [{tabId: 4, text: 'ERR'}]);
  await app.listeners.clicked({menuItemId: 'qrify-page'}, undefined);
  assert.equal(app.errors.length, 2);
});

function popup(tabs, lastError) {
  const qrCode = {};
  const input = {value: '', addEventListener: (type, listener) => { input[type] = listener; }};
  const error = {hidden: true};
  const queries = [];
  vm.runInNewContext(source('src/page_action/script.js'), {
    document: {querySelector: selector => ({'#qrCode': qrCode, '#input': input, '#error': error}[selector])},
    chrome: {
      runtime: {lastError},
      tabs: {query: (query, callback) => { queries.push(plain(query)); callback(tabs); }}
    },
    console: {error: () => {}}
  });
  return {qrCode, input, error, queries};
}

test('popup uses active tab query and retains editable input with the 500-character cap', () => {
  const app = popup([{url: 'https://example.com/'}]);
  assert.deepEqual(app.queries, [{active: true, currentWindow: true}]);
  assert.equal(app.qrCode.data, 'https://example.com/');
  app.input.value = 'b'.repeat(501);
  app.input.input();
  assert.equal(app.input.value.length, 500);
  assert.equal(app.qrCode.data, app.input.value);
  assert.equal(app.input.rows, 6);
  app.input.value = '';
  app.input.input();
  assert.equal(app.input.rows, 1);
});

test('popup reports unavailable tab data and recovers when text is entered', () => {
  for (const app of [popup([]), popup([], {message: 'Tab query failed'})]) {
    assert.equal(app.error.hidden, false);
    assert.ok(app.error.textContent.length > 0);
    app.input.value = 'manual input';
    app.input.input();
    assert.equal(app.qrCode.data, 'manual input');
    assert.equal(app.error.hidden, true);
  }
});

test('bundled QR generator can be injected repeatedly without duplicate registration', () => {
  const registry = new Map();
  const context = vm.createContext({
    HTMLElement: class {},
    customElements: {
      get: name => registry.get(name),
      define: (name, element) => {
        assert.equal(registry.has(name), false);
        registry.set(name, element);
      }
    }
  });
  vm.runInContext(source('js/qr-code.js'), context);
  const generator = context.QRCode;
  const element = registry.get('qr-code');
  const matrix = plain(generator.generate('QRify'));
  vm.runInContext(source('js/qr-code.js'), context);
  assert.equal(context.QRCode, generator);
  assert.equal(registry.get('qr-code'), element);
  assert.deepEqual(plain(generator.generate('QRify')), matrix);
});

test('QR generation works in isolated worlds without a custom element registry', () => {
  const context = vm.createContext({HTMLElement: class {}, customElements: null});
  vm.runInContext(source('js/qr-code.js'), context);
  const matrix = context.QRCode.generate('isolated world');
  assert.ok(matrix.length >= 21);
  assert.ok(matrix.every(row => row.length === matrix.length));
});
