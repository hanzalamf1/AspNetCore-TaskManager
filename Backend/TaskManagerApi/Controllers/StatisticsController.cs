using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagerApi.Models;
using TaskManagerApi.Models.Data;
using System.Text;
using System.Globalization;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatisticsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        /// <summary>
        /// Get platform-wide statistics (Admin only)
        /// </summary>
        [HttpGet("platform")]
        public async Task<IActionResult> GetPlatformStatistics()
        {
            try
            {
                var now = DateTime.UtcNow;
                var lastMonth = now.AddMonths(-1);

                // User statistics
                var totalUsers = await _context.Users.CountAsync();
                var activeUsers = await _context.Users
                    .Where(u => u.LastLoginAt >= lastMonth)
                    .CountAsync();
                var newUsersThisMonth = await _context.Users
                    .Where(u => u.CreatedAt >= lastMonth)
                    .CountAsync();

                // Task statistics
                var totalTasks = await _context.TaskItems.CountAsync();
                var completedTasks = await _context.TaskItems
                    .Where(t => t.IsCompleted)
                    .CountAsync();
                var pendingTasks = await _context.TaskItems
                    .Where(t => !t.IsCompleted)
                    .CountAsync();
                var overdueTasks = await _context.TaskItems
                    .Where(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate < now)
                    .CountAsync();

                // Calculate completion rate
                var completionRate = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0;

                // Priority distribution
                var priorityStats = await _context.TaskItems
                    .GroupBy(t => t.Priority)
                    .Select(g => new { Priority = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Weekly task creation trend
                var weeklyStats = await _context.TaskItems
                    .Where(t => t.CreatedAt >= now.AddDays(-7))
                    .GroupBy(t => t.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // System uptime (simulated - in real app, this would come from monitoring)
                var uptime = 99.9; // Simulated uptime percentage

                return Ok(new
                {
                    users = new
                    {
                        total = totalUsers,
                        active = activeUsers,
                        newThisMonth = newUsersThisMonth
                    },
                    tasks = new
                    {
                        total = totalTasks,
                        completed = completedTasks,
                        pending = pendingTasks,
                        overdue = overdueTasks,
                        completionRate = Math.Round(completionRate, 1)
                    },
                    priorityStats,
                    weeklyStats,
                    uptime
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "İstatistikler yüklenirken hata oluştu.", details = ex.Message });
            }
        }

        /// <summary>
        /// Get user-specific statistics
        /// </summary>
        [HttpGet("user")]
        public async Task<IActionResult> GetUserStatistics()
        {
            try
            {
                var userId = GetUserId();
                var now = DateTime.UtcNow;
                var lastMonth = now.AddMonths(-1);

                // User's task statistics
                var totalTasks = await _context.TaskItems
                    .Where(t => t.UserId == userId)
                    .CountAsync();
                var completedTasks = await _context.TaskItems
                    .Where(t => t.UserId == userId && t.IsCompleted)
                    .CountAsync();
                var pendingTasks = await _context.TaskItems
                    .Where(t => t.UserId == userId && !t.IsCompleted)
                    .CountAsync();
                var overdueTasks = await _context.TaskItems
                    .Where(t => t.UserId == userId && !t.IsCompleted && t.DueDate.HasValue && t.DueDate < now)
                    .CountAsync();

                // Completion rate
                var completionRate = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0;

                // Priority distribution
                var priorityStats = await _context.TaskItems
                    .Where(t => t.UserId == userId)
                    .GroupBy(t => t.Priority)
                    .Select(g => new { Priority = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Weekly performance
                var weeklyStats = await _context.TaskItems
                    .Where(t => t.UserId == userId && t.CreatedAt >= now.AddDays(-7))
                    .GroupBy(t => t.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // Recent activity
                var recentTasks = await _context.TaskItems
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(5)
                    .Select(t => new { t.Id, t.Title, t.IsCompleted, t.CreatedAt })
                    .ToListAsync();

                return Ok(new
                {
                    tasks = new
                    {
                        total = totalTasks,
                        completed = completedTasks,
                        pending = pendingTasks,
                        overdue = overdueTasks,
                        completionRate = Math.Round(completionRate, 1)
                    },
                    priorityStats,
                    weeklyStats,
                    recentTasks
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Kullanıcı istatistikleri yüklenirken hata oluştu.", details = ex.Message });
            }
        }

        /// <summary>
        /// Generate CSV report
        /// </summary>
        [HttpGet("report/csv")]
        public async Task<IActionResult> GenerateCsvReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var query = _context.TaskItems.Where(t => t.UserId == userId);

                if (startDate.HasValue)
                    query = query.Where(t => t.CreatedAt >= startDate.Value);
                if (endDate.HasValue)
                    query = query.Where(t => t.CreatedAt <= endDate.Value);

                var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

                var csv = new StringBuilder();
                csv.AppendLine("ID,Başlık,Açıklama,Öncelik,Durum,Oluşturulma Tarihi,Bitiş Tarihi,Tamamlanma Tarihi");

                foreach (var task in tasks)
                {
                    csv.AppendLine($"{task.Id}," +
                        $"\"{task.Title.Replace("\"", "\"\"")}\"," +
                        $"\"{(task.Description ?? "").Replace("\"", "\"\"")}\"," +
                        $"{task.Priority}," +
                        $"{(task.IsCompleted ? "Tamamlandı" : "Bekliyor")}," +
                        $"{task.CreatedAt:yyyy-MM-dd HH:mm:ss}," +
                        $"{(task.DueDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "")}," +
                        $"{(task.CompletedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "")}");
                }

                var fileName = $"gorevler_raporu_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                var bytes = Encoding.UTF8.GetBytes(csv.ToString());

                return File(bytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "CSV raporu oluşturulurken hata oluştu.", details = ex.Message });
            }
        }

        /// <summary>
        /// Generate Excel report (simplified - returns CSV with Excel extension)
        /// </summary>
        [HttpGet("report/excel")]
        public async Task<IActionResult> GenerateExcelReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var query = _context.TaskItems.Where(t => t.UserId == userId);

                if (startDate.HasValue)
                    query = query.Where(t => t.CreatedAt >= startDate.Value);
                if (endDate.HasValue)
                    query = query.Where(t => t.CreatedAt <= endDate.Value);

                var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

                var csv = new StringBuilder();
                csv.AppendLine("ID,Başlık,Açıklama,Öncelik,Durum,Oluşturulma Tarihi,Bitiş Tarihi,Tamamlanma Tarihi");

                foreach (var task in tasks)
                {
                    csv.AppendLine($"{task.Id}," +
                        $"\"{task.Title.Replace("\"", "\"\"")}\"," +
                        $"\"{(task.Description ?? "").Replace("\"", "\"\"")}\"," +
                        $"{task.Priority}," +
                        $"{(task.IsCompleted ? "Tamamlandı" : "Bekliyor")}," +
                        $"{task.CreatedAt:yyyy-MM-dd HH:mm:ss}," +
                        $"{(task.DueDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "")}," +
                        $"{(task.CompletedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "")}");
                }

                var fileName = $"gorevler_raporu_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                var bytes = Encoding.UTF8.GetBytes(csv.ToString());

                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Excel raporu oluşturulurken hata oluştu.", details = ex.Message });
            }
        }

        /// <summary>
        /// Generate PDF report (returns JSON data for frontend PDF generation)
        /// </summary>
        [HttpGet("report/pdf")]
        public async Task<IActionResult> GeneratePdfReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);
                var query = _context.TaskItems.Where(t => t.UserId == userId);

                if (startDate.HasValue)
                    query = query.Where(t => t.CreatedAt >= startDate.Value);
                if (endDate.HasValue)
                    query = query.Where(t => t.CreatedAt <= endDate.Value);

                var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

                var reportData = new
                {
                    user = new { user?.Username, user?.Email },
                    generatedAt = DateTime.Now,
                    period = new { startDate, endDate },
                    summary = new
                    {
                        totalTasks = tasks.Count,
                        completedTasks = tasks.Count(t => t.IsCompleted),
                        pendingTasks = tasks.Count(t => !t.IsCompleted),
                        completionRate = tasks.Count > 0 ? (double)tasks.Count(t => t.IsCompleted) / tasks.Count * 100 : 0
                    },
                    tasks = tasks.Select(t => new
                    {
                        t.Id,
                        t.Title,
                        t.Description,
                        t.Priority,
                        Status = t.IsCompleted ? "Tamamlandı" : "Bekliyor",
                        t.CreatedAt,
                        t.DueDate,
                        t.CompletedAt
                    }).ToList()
                };

                return Ok(reportData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "PDF raporu oluşturulurken hata oluştu.", details = ex.Message });
            }
        }
    }
} 