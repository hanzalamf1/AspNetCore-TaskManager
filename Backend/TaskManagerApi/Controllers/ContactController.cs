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
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SendMessage([FromBody] Contact contact)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Mesaj gönderilirken bir hata oluştu." });
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMessages([FromQuery] string? status = null, [FromQuery] int? priority = null, [FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Contacts.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.Status == status);

            if (priority.HasValue)
                query = query.Where(c => c.Priority == priority.Value);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(c => c.Name.Contains(search) || c.Email.Contains(search) || c.Subject.Contains(search) || c.Message.Contains(search));

            var totalCount = await query.CountAsync();
            var messages = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                messages,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetMessage(int id)
        {
            var message = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id);
            if (message == null)
                return NotFound("Mesaj bulunamadı.");

            return Ok(message);
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var message = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id);
            if (message == null)
                return NotFound("Mesaj bulunamadı.");

            message.Status = request.Status;
            
            if (request.Status == "read" && !message.ReadAt.HasValue)
                message.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpPut("{id}/priority")]
        [Authorize]
        public async Task<IActionResult> UpdatePriority(int id, [FromBody] UpdatePriorityRequest request)
        {
            var message = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id);
            if (message == null)
                return NotFound("Mesaj bulunamadı.");

            message.Priority = request.Priority;
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpPut("{id}/reply")]
        [Authorize]
        public async Task<IActionResult> ReplyToMessage(int id, [FromBody] ReplyRequest request)
        {
            var message = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id);
            if (message == null)
                return NotFound("Mesaj bulunamadı.");

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            message.ReplyMessage = request.ReplyMessage;
            message.RepliedAt = DateTime.UtcNow;
            message.RepliedByUserId = userId;
            message.Status = "replied";

            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpPut("{id}/notes")]
        [Authorize]
        public async Task<IActionResult> UpdateNotes(int id, [FromBody] UpdateNotesRequest request)
        {
            var message = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id);
            if (message == null)
                return NotFound("Mesaj bulunamadı.");

            message.AdminNotes = request.Notes;
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id);
            if (message == null)
                return NotFound("Mesaj bulunamadı.");

            _context.Contacts.Remove(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mesaj başarıyla silindi." });
        }

        [HttpGet("statistics")]
        [Authorize]
        public async Task<IActionResult> GetStatistics()
        {
            var totalMessages = await _context.Contacts.CountAsync();
            var pendingMessages = await _context.Contacts.CountAsync(c => c.Status == "pending");
            var repliedMessages = await _context.Contacts.CountAsync(c => c.Status == "replied");
            var closedMessages = await _context.Contacts.CountAsync(c => c.Status == "closed");

            var priorityStats = await _context.Contacts
                .GroupBy(c => c.Priority)
                .Select(g => new { Priority = g.Key, Count = g.Count() })
                .ToListAsync();

            var monthlyStats = await _context.Contacts
                .Where(c => c.CreatedAt >= DateTime.UtcNow.AddMonths(-6))
                .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
                .Select(g => new { 
                    Year = g.Key.Year, 
                    Month = g.Key.Month, 
                    Count = g.Count() 
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(new
            {
                totalMessages,
                pendingMessages,
                repliedMessages,
                closedMessages,
                priorityStats,
                monthlyStats
            });
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdatePriorityRequest
    {
        public int Priority { get; set; }
    }

    public class ReplyRequest
    {
        public string ReplyMessage { get; set; } = string.Empty;
    }

    public class UpdateNotesRequest
    {
        public string Notes { get; set; } = string.Empty;
    }
} 