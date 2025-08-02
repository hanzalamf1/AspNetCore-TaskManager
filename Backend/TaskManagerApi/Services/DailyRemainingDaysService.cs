using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using TaskManagerApi.Models.Data;
using Microsoft.EntityFrameworkCore;

namespace TaskManagerApi.Services
{
    public class DailyRemainingDaysService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        public DailyRemainingDaysService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextRun = now.Date.AddDays(1).AddMinutes(5); // Her gün 00:05'te çalışsın
                var delay = nextRun - now;
                if (delay < TimeSpan.Zero) delay = TimeSpan.FromMinutes(1);
                await Task.Delay(delay, stoppingToken);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var users = await db.Users.Where(u => u.RemainingDays > 0).ToListAsync();
                    foreach (var user in users)
                    {
                        user.RemainingDays -= 1;
                    }
                    await db.SaveChangesAsync();
                }
            }
        }
    }
} 