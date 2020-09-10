using FlightManager.Hubs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System;
using System.Windows.Forms;

namespace FlightManager.SimLink
{
    static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SimLinkContext());
        }
    }

    internal class SimLinkContext : ApplicationContext
    {
        NotifyIcon notifyIcon;
        SimLinkHub hub;
        SimLinkClient client;

        private IHost _webHost;

        public SimLinkContext()
        {
            notifyIcon = new NotifyIcon
            {
                ContextMenuStrip = new ContextMenuStrip
                {
                    Items =
                    {
                        new ToolStripLabel () { Text = "https://localhost:5001" },
                        new ToolStripMenuItem("Send test flight data", null, OnTestClick),
                        new ToolStripSeparator(),
                        new ToolStripMenuItem("Exit", null, OnExitClick),
                    }
                },
                Icon = new System.Drawing.Icon("Data/simlink.ico", 256, 256),
                Visible = true
            };
            InitWebHost();
            InitSimLink();

        }

        private async void InitWebHost()
        {
            _webHost = Host.CreateDefaultBuilder()
                .ConfigureWebHostDefaults(builder => builder.UseStartup<Startup>())
                //.UseEnvironment("Development")
                .UseEnvironment("Production")
                .Build();
            await _webHost.RunAsync();
        }

        private void InitSimLink()
        {
            // Get a reference to the SignalR SimLinkHub
            hub = (SimLinkHub)_webHost.Services.GetService(typeof(SimLinkHub));
            // Get a reference to the SimLinkClient and initialize
            client = (SimLinkClient)_webHost.Services.GetService(typeof(SimLinkClient));
            client.Initialize();
        }

        private async void OnExitClick(object sender, EventArgs e)
        {
            try
            {
                notifyIcon.Visible = false;
                await _webHost.StopAsync();
                _webHost.Dispose();
                Application.Exit();
            }
            catch (Exception)
            {
            }
        }

        private async void OnTestClick(object sender, EventArgs e)
        {
            await hub.SendPositionObject(new SimUpdate
            {
                latitude = 52.2511651,
                longitude = -5.251215,
                altitude = 1952,
                trueHeading = 247,
                fuelQty = 24.6,
                airline = "TechDevs Air",
                flightNumber = "TDV001",
                onGround = false,
                groundSpeed = 142
            });
        }
    }
}
