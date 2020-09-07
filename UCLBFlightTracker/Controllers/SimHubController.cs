using Microsoft.AspNetCore.Mvc;

namespace FlightManager.Controllers
{
    public class SimHubController : ControllerBase
    {
        private readonly FlightSimConnector client;

        public SimHubController(FlightSimConnector client)
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
