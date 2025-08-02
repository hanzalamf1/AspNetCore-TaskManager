using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Models;
using TaskManagerApi.Models.Data;
using BCrypt.Net;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // Kullanıcıları listele
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.PhoneNumber,
                    u.Role,
                    TaskCount = u.Tasks.Count,
                    u.RemainingDays
                })
                .ToListAsync();
            return Ok(users);
        }

        // Kullanıcı ekle
        [HttpPost("users")]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.PasswordHash) || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PhoneNumber))
                return BadRequest(new { message = "Tüm alanlar zorunludur." });
            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                return Conflict(new { message = "Bu kullanıcı adı zaten alınmış." });
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return Conflict(new { message = "Bu e-posta zaten kayıtlı." });
            if (await _context.Users.AnyAsync(u => u.PhoneNumber == user.PhoneNumber))
                return Conflict(new { message = "Bu telefon numarası zaten kayıtlı." });
            // Sadece 15, 30, 90 gün atanabilir
            if (user.RemainingDays != 15 && user.RemainingDays != 30 && user.RemainingDays != 90)
                return BadRequest(new { message = "Kalan gün sadece 15, 30 veya 90 olabilir." });
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Kullanıcı başarıyla eklendi." });
        }

        // Kullanıcı güncelle
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto user)
        {
            try
            {
                var dbUser = await _context.Users.FindAsync(id);
                if (dbUser == null)
                    return NotFound(new { message = "Kullanıcı bulunamadı." });
                if (!string.IsNullOrWhiteSpace(user.Username)) dbUser.Username = user.Username;
                if (!string.IsNullOrWhiteSpace(user.Email)) dbUser.Email = user.Email;
                if (!string.IsNullOrWhiteSpace(user.PhoneNumber)) dbUser.PhoneNumber = user.PhoneNumber;
                if (!string.IsNullOrWhiteSpace(user.Role)) dbUser.Role = user.Role;
                if (!string.IsNullOrWhiteSpace(user.Password)) dbUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);
                if (user.RemainingDays.HasValue) {
                    if (user.RemainingDays.Value != 15 && user.RemainingDays.Value != 30 && user.RemainingDays.Value != 90)
                        return BadRequest(new { message = "Kalan gün sadece 15, 30 veya 90 olabilir." });
                    dbUser.RemainingDays = user.RemainingDays.Value;
                }
                await _context.SaveChangesAsync();
                return Ok(new { message = "Kullanıcı güncellendi.", user = dbUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        // Kullanıcı sil
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var dbUser = await _context.Users.Include(u => u.Tasks).FirstOrDefaultAsync(u => u.Id == id);
            if (dbUser == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            _context.TaskItems.RemoveRange(dbUser.Tasks); // ilişkili görevleri de sil
            _context.Users.Remove(dbUser);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Kullanıcı ve görevleri silindi." });
        }

        // Görevleri listele (isteğe bağlı userId ile filtreleme)
        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks([FromQuery] int? userId = null)
        {
            var query = _context.TaskItems.Include(t => t.User).AsQueryable();
            if (userId.HasValue)
                query = query.Where(t => t.UserId == userId);
            var tasks = await query
                .Select(t => new {
                    id = t.Id,
                    title = t.Title,
                    description = t.Description,
                    isCompleted = t.IsCompleted,
                    userId = t.UserId,
                    username = t.User.Username
                })
                .ToListAsync();
            return Ok(tasks);
        }

        // Görev ekle
        [HttpPost("tasks")]
        public async Task<IActionResult> AddTask([FromBody] TaskItem task)
        {
            if (string.IsNullOrWhiteSpace(task.Title))
                return BadRequest(new { message = "Başlık zorunludur." });
            if (task.Title.Length > 50)
                return BadRequest(new { message = "Başlık en fazla 50 karakter olmalı." });
            if (task.Description != null && task.Description.Length > 200)
                return BadRequest(new { message = "Açıklama en fazla 200 karakter olabilir." });
            if (task.UserId == 0 || await _context.Users.FindAsync(task.UserId) == null)
                return BadRequest(new { message = "Geçerli bir kullanıcı seçilmelidir." });
            task.IsCompleted = false;
            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Görev başarıyla eklendi." });
        }

        // Görev güncelle
        [HttpPut("tasks/{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskItem task)
        {
            var dbTask = await _context.TaskItems.FindAsync(id);
            if (dbTask == null)
                return NotFound(new { message = "Görev bulunamadı." });
            if (!string.IsNullOrWhiteSpace(task.Title)) dbTask.Title = task.Title;
            if (task.Description != null) dbTask.Description = task.Description;
            dbTask.IsCompleted = task.IsCompleted;
            if (!string.IsNullOrWhiteSpace(task.Priority)) dbTask.Priority = task.Priority;
            if (task.DueDate.HasValue) dbTask.DueDate = task.DueDate;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Görev güncellendi." });
        }

        // Görev sil
        [HttpDelete("tasks/{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var dbTask = await _context.TaskItems.FindAsync(id);
            if (dbTask == null)
                return NotFound(new { message = "Görev bulunamadı." });
            _context.TaskItems.Remove(dbTask);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Görev silindi." });
        }


    }
} 