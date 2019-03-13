using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace server
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");

            var httpserver = new light.http.server.httpserver();
            httpserver.SetFailAction(on404);
            httpserver.SetWebsocketAction("/wsapi", onWebsocketIn);

            httpserver.Start(80);

            Console.ReadLine();

        }
        static async Task on404(HttpContext context)
        {
            await context.Response.WriteAsync("only websocket connect.");
            return;
        }
        static light.http.server.httpserver.IWebSocketPeer onWebsocketIn(System.Net.WebSockets.WebSocket websocket)
        {
            return new Session(websocket);
        }
    }

    class Session : light.http.server.httpserver.IWebSocketPeer
    {
        System.Net.WebSockets.WebSocket websocket;
        static System.Collections.Concurrent.ConcurrentDictionary<UInt32, Session> allSession
            = new System.Collections.Concurrent.ConcurrentDictionary<uint, Session>();
        static UInt32 TotalsessionID;
        UInt32 sessionID;
        public Session(System.Net.WebSockets.WebSocket websocket)
        {
            this.websocket = websocket;

            //管理所有连接
            TotalsessionID++;
            this.sessionID = TotalsessionID;
        }
        public async void Send(string txt)
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(txt);
            await websocket.SendAsync(bytes,
            System.Net.WebSockets.WebSocketMessageType.Text,
            true,
            System.Threading.CancellationToken.None);

        }
        public async Task OnConnect()
        {
            Console.WriteLine("a session in");

            //send hello
            string send = "{\"cmd\":\"login\",\"sessionID\":" + this.sessionID + "}";
            this.Send(send);

            //加入连接池
            allSession[this.sessionID] = this;

        }

        public async Task OnDisConnect()
        {
            Console.WriteLine("a session close");
            //退出连接池
            allSession.TryRemove(this.sessionID, out Session session);
        }

        public async Task OnRecv(MemoryStream stream, int count)
        {
            var bytes = stream.ToArray();
            var txt = System.Text.Encoding.UTF8.GetString(bytes);
            //不分析了，把收到的所有信息，作为一个数据源
            Console.WriteLine("got a data:" + txt);

            foreach (var s in allSession)
            {
                if (this.sessionID == s.Key) continue;

                try
                {
                    s.Value.Send(txt);
                }
                catch
                {

                }
            }
        }
    }
}
