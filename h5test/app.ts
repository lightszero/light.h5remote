class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    htmlWSState: HTMLSpanElement;
    htmlID: HTMLSpanElement;
    htmlLastRecv: HTMLSpanElement;
    ws: WebSocket;// a websocket obj;
    linked: boolean;
    id: number;
    constructor(element: HTMLElement) {
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
        btn.onclick = (ev: MouseEvent) => {
            this._onSend(ev);
        }
        this.element.appendChild(btn);

    }

    enterline() {
        var hr = document.createElement('hr');
        this.element.append(hr);

    }
    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);

        this.linked = false;

        try {
            //有时new 会马上连接，连接不通会立即出错，要try起来
            this.ws = new WebSocket("ws://127.0.0.1:80/wsapi");
        }
        catch (e) {
            alert(e.message);
        }
        this.ws.onopen = (ev) => {
            this._onopen(ev);
        }
        this.ws.onmessage = (ev) => {
            this._onmessage(ev);
        }
        this.ws.onclose = (ev) => {
            this._onclose(ev);

        }
        this.ws.onerror = (ev) => {
            this._onerror(ev);
        }
    }
    _onopen(ev: Event) {
        this.htmlWSState.textContent = "websocket  connected.";
        this.linked = true;
    }
    _onSend(ev: MouseEvent) {
        var sendobj = { 'evt': 'make a event', 'fromsession': this.id };
        this.ws.send(JSON.stringify(sendobj));
    }
    _onmessage(ev: MessageEvent) {
        if (typeof (ev.data) == "string")//string mode
        {
            //recv a string
            this.htmlLastRecv.textContent = ev.data as string;
            var obj = JSON.parse(ev.data);
            if (obj["cmd"] != undefined) {
                if (obj["cmd"] == "login") {
                    this.id = obj["sessionID"];
                    this.htmlID.textContent = "my websocket sessionID=" + this.id;
                }
            }
        }
        else if (ev.data instanceof ArrayBuffer)//bytearray mode
        {
            this.htmlLastRecv.textContent = "***bytearray mode.";
        }
        else {
            this.htmlLastRecv.textContent = "*** unknown.";
        }
    }
    _onclose(ev: CloseEvent) {
        this.htmlWSState.textContent = "websocket end connected.";
        this.linked = false;

    }
    _onerror(ev: Event) {
        this.htmlWSState.textContent = "websocket end connected.";
        this.linked = false;

    }
    stop() {
        clearTimeout(this.timerToken);
    }

}

window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};