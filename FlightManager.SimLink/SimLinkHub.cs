using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace FlightManager.Hubs
{
    public class SimLinkHub : Hub
    {
        private readonly IHubContext<SimLinkHub> context;

        public SimLinkHub(IHubContext<SimLinkHub> context)
        {
            this.context = context;
        }

        public async Task SendPositionObject(Position p)
        {
            var json = JsonConvert.SerializeObject(p, Formatting.None);
            await context.Clients.All.SendAsync("PositionObject", json);
        }
    }
}
