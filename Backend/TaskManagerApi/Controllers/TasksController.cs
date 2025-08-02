using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagerApi.Models;
using TaskManagerApi.Models.Data;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] string? search = null, [FromQuery] string? status = null, 
            [FromQuery] string? priority = null, [FromQuery] DateTime? dateFrom = null, [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? sortBy = "createdAt", [FromQuery] string? sortOrder = "desc")
        {
            var userId = GetUserId();
            var query = _context.TaskItems.Where(t => t.UserId == userId);

            // Search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.Title.Contains(search) || (t.Description != null && t.Description.Contains(search)));
            }

            // Status filter
            if (!string.IsNullOrWhiteSpace(status))
            {
                switch (status.ToLower())
                {
                    case "completed":
                        query = query.Where(t => t.IsCompleted);
                        break;
                    case "pending":
                        query = query.Where(t => !t.IsCompleted);
                        break;
                    case "overdue":
                        query = query.Where(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate < DateTime.UtcNow);
                        break;
                }
            }

            // Priority filter
            if (!string.IsNullOrWhiteSpace(priority))
            {
                query = query.Where(t => t.Priority == priority);
            }

            // Date range filter
            if (dateFrom.HasValue)
            {
                query = query.Where(t => t.DueDate >= dateFrom.Value);
            }
            if (dateTo.HasValue)
            {
                query = query.Where(t => t.DueDate <= dateTo.Value);
            }

            // Sorting
            query = sortBy.ToLower() switch
            {
                "title" => sortOrder == "asc" ? query.OrderBy(t => t.Title) : query.OrderByDescending(t => t.Title),
                "duedate" => sortOrder == "asc" ? query.OrderBy(t => t.DueDate) : query.OrderByDescending(t => t.DueDate),
                "priority" => sortOrder == "asc" ? query.OrderBy(t => t.Priority) : query.OrderByDescending(t => t.Priority),
                _ => sortOrder == "asc" ? query.OrderBy(t => t.CreatedAt) : query.OrderByDescending(t => t.CreatedAt)
            };

            var tasks = await query.ToListAsync();
            return Ok(tasks);
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetTaskStatistics()
        {
            var userId = GetUserId();
            var now = DateTime.UtcNow;

            var totalTasks = await _context.TaskItems.CountAsync(t => t.UserId == userId);
            var completedTasks = await _context.TaskItems.CountAsync(t => t.UserId == userId && t.IsCompleted);
            var pendingTasks = await _context.TaskItems.CountAsync(t => t.UserId == userId && !t.IsCompleted);
            var overdueTasks = await _context.TaskItems.CountAsync(t => t.UserId == userId && !t.IsCompleted && t.DueDate.HasValue && t.DueDate < now);

            var priorityStats = await _context.TaskItems
                .Where(t => t.UserId == userId)
                .GroupBy(t => t.Priority)
                .Select(g => new { Priority = g.Key, Count = g.Count() })
                .ToListAsync();

            var weeklyStats = await _context.TaskItems
                .Where(t => t.UserId == userId && t.CreatedAt >= now.AddDays(-7))
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                completionRate = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0,
                priorityStats,
                weeklyStats
            });
        }

        [HttpPost]
        public async Task<IActionResult> AddTask([FromBody] TaskItem task)
        {
            if (string.IsNullOrWhiteSpace(task.Title) || task.Title.Length > 200)
                return BadRequest("Başlık zorunlu ve en fazla 200 karakter olmalı.");
            if (task.Description != null && task.Description.Length > 1000)
                return BadRequest("Açıklama en fazla 1000 karakter olabilir.");
            
            var userId = GetUserId();
            task.UserId = userId;
            task.IsCompleted = false;
            task.CreatedAt = DateTime.UtcNow;
            task.Priority = task.Priority ?? "medium";
            
            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();
            
            return Ok(task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskItem task)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (dbTask == null)
                return NotFound("Görev bulunamadı veya yetkiniz yok.");
            
            if (string.IsNullOrWhiteSpace(task.Title) || task.Title.Length > 200)
                return BadRequest("Başlık zorunlu ve en fazla 200 karakter olmalı.");
            if (task.Description != null && task.Description.Length > 1000)
                return BadRequest("Açıklama en fazla 1000 karakter olabilir.");
            
            dbTask.Title = task.Title;
            dbTask.Description = task.Description;
            dbTask.DueDate = task.DueDate;
            dbTask.Priority = task.Priority ?? dbTask.Priority;
            dbTask.IsCompleted = task.IsCompleted;
            
            // Set completedAt when task is completed
            if (task.IsCompleted && !dbTask.IsCompleted)
            {
                dbTask.CompletedAt = DateTime.UtcNow;
            }
            else if (!task.IsCompleted)
            {
                dbTask.CompletedAt = null;
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(dbTask);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteTask(int id)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (dbTask == null)
                return NotFound("Görev bulunamadı veya yetkiniz yok.");
            
            dbTask.IsCompleted = true;
            dbTask.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return Ok(dbTask);
        }

        [HttpPut("{id}/toggle-completion")]
        public async Task<IActionResult> ToggleTaskCompletion(int id, [FromBody] bool isCompleted)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (dbTask == null)
                return NotFound("Görev bulunamadı veya yetkiniz yok.");
            
            dbTask.IsCompleted = isCompleted;
            
            if (isCompleted)
            {
                dbTask.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                dbTask.CompletedAt = null;
            }
            
            await _context.SaveChangesAsync();
            return Ok(dbTask);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (dbTask == null)
                return NotFound("Görev bulunamadı veya yetkiniz yok.");
            
            _context.TaskItems.Remove(dbTask);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("bulk-complete")]
        public async Task<IActionResult> BulkCompleteTasks([FromBody] int[] taskIds)
        {
            var userId = GetUserId();
            var tasks = await _context.TaskItems
                .Where(t => taskIds.Contains(t.Id) && t.UserId == userId)
                .ToListAsync();

            foreach (var task in tasks)
            {
                task.IsCompleted = true;
                task.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok($" {tasks.Count} görev tamamlandı.");
        }

        [HttpDelete("bulk-delete")]
        public async Task<IActionResult> BulkDeleteTasks([FromBody] int[] taskIds)
        {
            var userId = GetUserId();
            var tasks = await _context.TaskItems
                .Where(t => taskIds.Contains(t.Id) && t.UserId == userId)
                .ToListAsync();

            _context.TaskItems.RemoveRange(tasks);
            await _context.SaveChangesAsync();
            return Ok($" {tasks.Count} görev silindi.");
        }

        /// <summary>
        /// Approve a task (Admin only)
        /// </summary>
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveTask(int id)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
            if (dbTask == null)
                return NotFound("Görev bulunamadı.");
            
            dbTask.Status = "approved";
            dbTask.ApprovedAt = DateTime.UtcNow;
            dbTask.ApprovedBy = userId;
            
            await _context.SaveChangesAsync();
            
            return Ok(dbTask);
        }

        /// <summary>
        /// Reject a task (Admin only)
        /// </summary>
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectTask(int id)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
            if (dbTask == null)
                return NotFound("Görev bulunamadı.");
            
            dbTask.Status = "rejected";
            dbTask.ApprovedAt = null;
            dbTask.ApprovedBy = null;
            
            await _context.SaveChangesAsync();
            
            return Ok(dbTask);
        }

        /// <summary>
        /// Revert approval status (Admin only)
        /// </summary>
        [HttpPut("{id}/revert-approval")]
        public async Task<IActionResult> RevertApproval(int id)
        {
            var userId = GetUserId();
            var dbTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
            if (dbTask == null)
                return NotFound("Görev bulunamadı.");
            
            dbTask.Status = "pending";
            dbTask.ApprovedAt = null;
            dbTask.ApprovedBy = null;
            
            await _context.SaveChangesAsync();
            return Ok(dbTask);
        }

        /// <summary>
        /// Get tasks by approval status (Admin only)
        /// </summary>
        [HttpGet("by-status/{status}")]
        public async Task<IActionResult> GetTasksByStatus(string status)
        {
            var userId = GetUserId();
            var query = _context.TaskItems.Where(t => t.UserId == userId);

            var tasks = status.ToLower() switch
            {
                "completed" => await query.Where(t => t.IsCompleted).ToListAsync(),
                "pending" => await query.Where(t => !t.IsCompleted).ToListAsync(),
                "overdue" => await query.Where(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate < DateTime.UtcNow).ToListAsync(),
                _ => await query.ToListAsync()
            };

            return Ok(tasks);
        }

        [HttpGet("export/{format}")]
        public async Task<IActionResult> ExportTasks(string format)
        {
            var userId = GetUserId();
            var tasks = await _context.TaskItems
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.CreatedAt)
                .ToListAsync();

            return format.ToLower() switch
            {
                "pdf" => await ExportToPdf(tasks),
                "excel" => await ExportToExcel(tasks),
                "csv" => await ExportToCsv(tasks),
                "json" => await ExportToJson(tasks),
                _ => BadRequest("Desteklenmeyen format. Desteklenen formatlar: pdf, excel, csv, json")
            };
        }

        private async Task<IActionResult> ExportToPdf(List<TaskItem> tasks)
        {
            var content = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; margin: 20px; }}
                        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                        th {{ background-color: #f2f2f2; }}
                        .completed {{ background-color: #d4edda; }}
                        .overdue {{ background-color: #f8d7da; }}
                    </style>
                </head>
                <body>
                    <h1>Görev Raporu</h1>
                    <p>Oluşturulma Tarihi: {DateTime.Now:dd.MM.yyyy HH:mm}</p>
                    <table>
                        <tr>
                            <th>Başlık</th>
                            <th>Açıklama</th>
                            <th>Öncelik</th>
                            <th>Bitiş Tarihi</th>
                            <th>Durum</th>
                        </tr>
                        {string.Join("", tasks.Select(t => $@"
                            <tr class='{(t.IsCompleted ? "completed" : (t.DueDate.HasValue && t.DueDate < DateTime.UtcNow ? "overdue" : ""))}'>
                                <td>{t.Title}</td>
                                <td>{t.Description ?? "-"}</td>
                                <td>{t.Priority}</td>
                                <td>{t.DueDate?.ToString("dd.MM.yyyy") ?? "-"}</td>
                                <td>{(t.IsCompleted ? "Tamamlandı" : (t.DueDate.HasValue && t.DueDate < DateTime.UtcNow ? "Gecikmiş" : "Bekliyor"))}</td>
                            </tr>
                        "))}
                    </table>
                </body>
                </html>";

            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            return File(bytes, "text/html", $"tasks_{DateTime.Now:yyyyMMdd}.html");
        }

        private async Task<IActionResult> ExportToExcel(List<TaskItem> tasks)
        {
            var csvContent = "Başlık,Açıklama,Öncelik,Bitiş Tarihi,Durum,Oluşturulma Tarihi\n";
            csvContent += string.Join("\n", tasks.Select(t => 
                $"\"{t.Title}\",\"{t.Description ?? ""}\",\"{t.Priority}\",\"{t.DueDate?.ToString("dd.MM.yyyy") ?? ""}\",\"{(t.IsCompleted ? "Tamamlandı" : (t.DueDate.HasValue && t.DueDate < DateTime.UtcNow ? "Gecikmiş" : "Bekliyor"))}\",\"{t.CreatedAt:dd.MM.yyyy HH:mm}\""));

            var bytes = System.Text.Encoding.UTF8.GetBytes(csvContent);
            return File(bytes, "text/csv", $"tasks_{DateTime.Now:yyyyMMdd}.csv");
        }

        private async Task<IActionResult> ExportToCsv(List<TaskItem> tasks)
        {
            var csvContent = "Başlık,Açıklama,Öncelik,Bitiş Tarihi,Durum,Oluşturulma Tarihi\n";
            csvContent += string.Join("\n", tasks.Select(t => 
                $"\"{t.Title}\",\"{t.Description ?? ""}\",\"{t.Priority}\",\"{t.DueDate?.ToString("dd.MM.yyyy") ?? ""}\",\"{(t.IsCompleted ? "Tamamlandı" : (t.DueDate.HasValue && t.DueDate < DateTime.UtcNow ? "Gecikmiş" : "Bekliyor"))}\",\"{t.CreatedAt:dd.MM.yyyy HH:mm}\""));

            var bytes = System.Text.Encoding.UTF8.GetBytes(csvContent);
            return File(bytes, "text/csv", $"tasks_{DateTime.Now:yyyyMMdd}.csv");
        }

        private async Task<IActionResult> ExportToJson(List<TaskItem> tasks)
        {
            var exportData = tasks.Select(t => new
            {
                t.Title,
                t.Description,
                t.Priority,
                DueDate = t.DueDate?.ToString("yyyy-MM-dd"),
                Status = t.IsCompleted ? "Tamamlandı" : (t.DueDate.HasValue && t.DueDate < DateTime.UtcNow ? "Gecikmiş" : "Bekliyor"),
                CreatedAt = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                CompletedAt = t.CompletedAt?.ToString("yyyy-MM-dd HH:mm:ss")
            });

            var jsonContent = System.Text.Json.JsonSerializer.Serialize(exportData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
            var bytes = System.Text.Encoding.UTF8.GetBytes(jsonContent);
            return File(bytes, "application/json", $"tasks_{DateTime.Now:yyyyMMdd}.json");
        }
    }
} 