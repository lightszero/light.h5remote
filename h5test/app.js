var Greeter = /** @class */ (function () {
    function Greeter(element) {
        var _this = this;
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
        this.enterline();
        this.htmlWSState = document.createElement('span');
        this.element.appendChild(this.htmlWSState);
        this.enterline();
        this.htmlID = document.createElement('span');
        this.element.appendChild(this.htmlID);
        this.enterline();
        this.htmlLastRecv = document.createElement('span');
        this.element.appendChild(this.htmlLastRecv);
        this.enterline();
        var btn = document.createElement('button');
        btn.textContent = "send sth.";
        btn.onclick = function (ev) {
            _this._onSend(ev);
        };
        this.element.appendChild(btn);
    }
    Greeter.prototype.enterline = function () {
        var hr = document.createElement('hr');
        this.element.append(hr);
    };
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = new Date().toUTCString(); }, 500);
        this.linked = false;
        try {
            //有时new 会马上连接，连接不通会立即出错，要try起来
            this.ws = new WebSocket("ws://127.0.0.1:80/wsapi");
        }
        catch (e) {
            alert(e.message);
        }
        this.ws.onopen = function (ev) {
            _this._onopen(ev);
        };
        this.ws.onmessage = function (ev) {
            _this._onmessage(ev);
        };
        this.ws.onclose = function (ev) {
            _this._onclose(ev);
        };
        this.ws.onerror = function (ev) {
            _this._onerror(ev);
        };
    };
    Greeter.prototype._onopen = function (ev) {
        this.htmlWSState.textContent = "websocket  connected.";
        this.linked = true;
    };
    Greeter.prototype._onSend = function (ev) {
        var sendobj = { 'evt': 'make a event', 'fromsession': this.id };
        this.ws.send(JSON.stringify(sendobj));
    };
    Greeter.prototype._onmessage = function (ev) {
        if (typeof (ev.data) == "string") //string mode
         {
            //recv a string
            this.htmlLastRecv.textContent = ev.data;
            var obj = JSON.parse(ev.data);
            if (obj["cmd"] != undefined) {
                if (obj["cmd"] == "login") {
                    this.id = obj["sessionID"];
                    this.htmlID.textContent = "my websocket sessionID=" + this.id;
                }
            }
        }
        else if (ev.data instanceof ArrayBuffer) //bytearray mode
         {
            this.htmlLastRecv.textContent = "***bytearray mode.";
        }
        else {
            this.htmlLastRecv.textContent = "*** unknown.";
        }
    };
    Greeter.prototype._onclose = function (ev) {
        this.htmlWSState.textContent = "websocket end connected.";
        this.linked = false;
    };
    Greeter.prototype._onerror = function (ev) {
        this.htmlWSState.textContent = "websocket end connected.";
        this.linked = false;
    };
    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
}());
window.onload = function () {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};
//# sourceMappingURL=app.js.map