using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using UCLBFlightTracker.Services;

namespace FlightManager.Controllers
{
    public class AiportsController : ControllerBase
    {
        private readonly AirportService aiportsService;

        public AiportsController(AirportService aiportsService)
        {
            this.aiportsService = aiportsService;
        }

        [HttpGet("airports")]
        public ActionResult<List<Airport>> GetAirports()
        {
            return aiportsService.Airports;
        }

        [HttpGet("airports/{ICAO}")]
        public ActionResult<Airport> GetAirportByICAO([FromRoute] string ICAO)
        {
            return aiportsService.Airports.FirstOrDefault(x => x.ICAO == ICAO);
        }

        [HttpGet("airports/byName/{name}")]
        public ActionResult<List<Airport>> GetAirportByName([FromRoute] string name)
        {
            return aiportsService.Airports.Where(x => x.Name.Contains(name)).ToList();
        }

        [HttpGet("airports/distanceBetween/{from}/{to}")]
        public ActionResult<double> GetAirportByICAO([FromRoute] string from, [FromRoute]string to)
        {
            return aiportsService.DistanceBetweenAirports(from, to);
        }

        [HttpGet("airports/{ICAO}/within/{miles}")]
        public ActionResult<List<Airport>> GetAirportByICAO([FromRoute] string ICAO, [FromRoute]int miles)
        {
            return aiportsService.AirportsInRangeOf(ICAO, miles);
        }
    }
}
