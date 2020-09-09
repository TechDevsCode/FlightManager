using GeoCoordinatePortable;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace FlightManager
{
    public class Airport
    {
        public GeoPosition Position { get => new GeoPosition(Latitude, Longitude); }
        public int AirportId { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string IATA { get; set; }
        public string ICAO { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Altitude { get; set; }
        public string Timezone { get; set; }
        public string DST { get; set; }
        public string TZ { get; set; }
        public string Type { get; set; }
        public string Source { get; set; }
        public double DistanceFrom { get; set; }
    }

    public class AirportService
    {
        public readonly List<Airport> Airports;

        public AirportService()
        {
            var jsonString = File.ReadAllText(@"Data/airports.json");
            Airports = JsonConvert.DeserializeObject<List<Airport>>(jsonString);
        }

        public List<Airport> AirportsInRangeOf(string ICAO, int miles)
        {
            var a1 = Airports.FirstOrDefault(x => x.ICAO == ICAO);
            GeoCoordinate c1 = new GeoCoordinate(a1.Latitude, a1.Longitude);
            return Airports
                .Select(x =>
                {
                    x.DistanceFrom = DistanceBetweenPoints(c1, new GeoCoordinate(x.Latitude, x.Longitude));
                    return x;
                })
                .Where(x => x.DistanceFrom <= miles)
                .ToList();
        }

        public double DistanceBetweenAirports(string from, string to)
        {
            var a1 = Airports.FirstOrDefault(x => x.ICAO == from);
            var a2 = Airports.FirstOrDefault(x => x.ICAO == to);
            var c1 = new GeoCoordinate(a1.Latitude, a1.Longitude);
            var c2 = new GeoCoordinate(a2.Latitude, a2.Longitude);
            return DistanceBetweenPoints(c1, c2);
        }

        public double DistanceBetweenPoints(GeoCoordinate from, GeoCoordinate to)
        {
            return from.GetDistanceTo(to) / 1000;
        }
    }
}
