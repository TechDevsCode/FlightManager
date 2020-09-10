using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using FlightManager.Hubs;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.AspNetCore.SpaServices.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System;
using System.IO;

namespace FlightManager.SimLink
{
    public class FlightManagerConfig
    {
        public bool UseDummySimData { get; set; }
    }

    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();
            services.Configure<FlightManagerConfig>(Configuration.GetSection("FlightManagerConfig"));
            services.AddSingleton(Configuration);

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", builder => builder
                .WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
            });

            services.AddControllersWithViews();
            services.AddSignalR();
            services.AddSingleton<SimLinkClient>();
            services.AddSingleton<SimLinkHub>();
            services.AddSingleton<AirportService>();

            //In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
            var spaConfig = new SpaStaticFilesOptions { RootPath = "ClientApp/dist" };
            services.AddSingleton(spaConfig);
            services.AddTransient<ISpaStaticFileProvider, StevesSpaStaticFileProvider>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();

            app.UseCors("CorsPolicy");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapHub<SimLinkHub>("/simlinkhub");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    // spa.UseAngularCliServer(npmScript: "start");
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                }
            });
        }
    }

    /// <summary>
    /// Provides an implementation of <see cref="ISpaStaticFileProvider"/> that supplies
    /// physical files at a location configured using <see cref="SpaStaticFilesOptions"/>.
    /// </summary>
    internal class StevesSpaStaticFileProvider : ISpaStaticFileProvider
    {
        private IFileProvider _fileProvider;

        public StevesSpaStaticFileProvider(
            IServiceProvider serviceProvider,
            SpaStaticFilesOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (string.IsNullOrEmpty(options.RootPath))
            {
                throw new ArgumentException($"The {nameof(options.RootPath)} property " +
                    $"of {nameof(options)} cannot be null or empty.");
            }

            var env = serviceProvider.GetRequiredService<IWebHostEnvironment>();
            var absoluteRootPath = Path.Combine(
                env.ContentRootPath,
                options.RootPath);

            // PhysicalFileProvider will throw if you pass a non-existent path,
            // but we don't want that scenario to be an error because for SPA
            // scenarios, it's better if non-existing directory just means we
            // don't serve any static files.
            if (Directory.Exists(absoluteRootPath))
            {
                _fileProvider = new PhysicalFileProvider(absoluteRootPath);
            }
        }

        public IFileProvider FileProvider => _fileProvider;
    }
}
