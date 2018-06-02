
var url = chrome.extension.getURL ("src/page_action/page_action.html");
var lbl = "";

console.log(url)
var stylePrefix = new URL(url).hostname;
chrome.storage.sync.get('data', function(data) {
    lbl = data.data;
    if(document.body.getAttribute("qr-extension-ready")!="yes")
    {

        /** Adding Head scripts */
        const scripts = ['/js/qr.js','/js/qr-code.js'];
        for(let scr of scripts) {
            const scrUrl = chrome.extension.getURL (scr);
            const scrElem = document.createElement("script");
            scrElem.src = scrUrl;
            console.log(scrUrl)
            document.head.append(scrElem);
        }

        /** Adding custom style node */
        const styleContent = `
        .` + stylePrefix + `_wrapper {
            position: fixed;
            text-align: center;
            top: 50%;
            left: 50%;
            transition: 0.3s linear all;
            display: inline-block;
            z-index: 1199;
            min-width: 200px;
            transform: translate(-50%, -50%);
            min-height: 100px;
            background: #fff;
            padding: 30px;
            border: 1px solid #3f00ff;
            box-shadow: 0 4px 15px -5px #1e1e1e;
        }

        .` + stylePrefix + `_wrapper:focus {
            outline: none;
            /*box-shadow: 0 12px 44px -14px #1e1e1e;*/
            box-shadow:0 12px 38px -12px #1e1e1e;

        }
        #` + stylePrefix + `_label {
            font-family: Segoe UI, Lucida Grande, Arial, Verdana;
            font-size: 14px;
            display: block;
            word-wrap: break-word;
            word-break: break-all;
        }
        #` + stylePrefix + `_close {
            position: absolute;
            right: -1px;
            text-decoration: none;
            font-family: Segoe UI, Lucida Grande, Arial, Verdana;
            top: -1px;
            height: 30px;
            width: 30px;
            line-height: 30px;
            background: #3f00ff;
            text-align: center;
            color: #fff;
            font-size: 18px;
            border-radius: 1px;
        }

        #` + stylePrefix + `_qrcode {
            position: relative;
            font-family: Segoe UI, Lucida Grande, Arial, Verdana;
            z-index: 1200;
        }
        `
        const styleElem = document.createElement('style');
        styleElem.innerHTML = styleContent;
        document.head.appendChild(styleElem);

        /** add structure */
        const wrapper  = document.createElement("div");
        wrapper.classList.add(stylePrefix + '_wrapper');
        wrapper.tabIndex=1;
        const wrapperContent = `
            <a id="` + stylePrefix +`_close" href="#">X</a>
            <qr-code data="` + lbl + `" id="` + stylePrefix +`_qrcode"></qr-code>
            <label id="` + stylePrefix +`_label">` + lbl +`</label>`;
        wrapper.innerHTML = wrapperContent;
        document.body.insertBefore (wrapper, document.body.firstChild);


        /** Add event listeners */
        document.getElementById( stylePrefix + '_close').addEventListener('click', e => {
            wrapper.style.display = "none";
            e.preventDefault();
            e.stopPropagation();
        });
        wrapper.addEventListener('keydown', e=> {
            if(e.keyCode==27)
                wrapper.style.display="none";
        })
        document.body.setAttribute('qr-extension-ready', "yes");
        
        wrapper.focus();
    } else {
        document.querySelector('#' + stylePrefix +  '_qrcode').setAttribute("data", lbl);
        document.querySelector('#' + stylePrefix +  '_label').innerHTML = lbl;
        let wrapper = document.querySelector('.' + stylePrefix +  '_wrapper');
        wrapper.style.display = "inline-block";
        wrapper.focus();
    }
    
});
