function showQRCode(data) {
  const wrapperId = chrome.runtime.id + '_wrapper';
  let wrapper = document.getElementById(wrapperId);
  const qrCode = QRCode.generateSVG(data, {modulesize: 5, margin: 4});
  qrCode.style.cssText = 'display: block; max-width: 100%; height: auto; margin: auto;';

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = wrapperId;
    wrapper.tabIndex = -1;
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-label', 'QRify');
    wrapper.style.cssText = `
      all: initial;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      width: max-content;
      max-width: 90vw;
    `;
    const shadow = wrapper.attachShadow({mode: 'open'});
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: relative;
      box-sizing: border-box;
      text-align: center;
      min-width: 200px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      background: #fff;
      padding: 30px;
      border: 1px solid #3f00ff;
      box-shadow: 0 4px 15px -5px #1e1e1e;
      font-family: Segoe UI, Lucida Grande, Arial, Verdana;
    `;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'X';
    close.setAttribute('aria-label', 'Close QR code');
    close.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      height: 30px;
      width: 30px;
      border: 0;
      background: #3f00ff;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    `;
    const code = document.createElement('div');
    code.id = 'qrcode';
    const label = document.createElement('div');
    label.id = 'label';
    label.style.cssText = 'font-size: 14px; overflow-wrap: anywhere; color: #673AB7;';
    close.addEventListener('click', () => {
      wrapper.style.display = 'none';
    });
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        wrapper.style.display = 'none';
        event.stopPropagation();
      }
    });
    panel.append(close, code, label);
    shadow.appendChild(panel);
    document.body.appendChild(wrapper);
  }
  wrapper.shadowRoot.getElementById('qrcode').replaceChildren(qrCode);
  wrapper.shadowRoot.getElementById('label').textContent = data;
  wrapper.style.display = 'block';
  wrapper.focus();
  return true;
}
