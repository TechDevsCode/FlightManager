using Microsoft.AspNetCore.Mvc;

namespace FlightManager.Controllers
{
    public class SimHubController : ControllerBase
    {
        private readonly SimLinkClient client;

        public SimHubController(SimLinkClient client)
        {
            this.client = client;
        }

        [HttpPost("initPlugin")]
        public ActionResult<bool> InitPlugin()
        {
            client.Initialize();
            return true;
        }
    }
}
