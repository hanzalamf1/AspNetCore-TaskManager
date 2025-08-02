using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Models;
using TaskManagerApi.Models.Data;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrderController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetOrders(int page = 1, int pageSize = 20)
        {
            var query = _context.Orders.Include(o => o.User).OrderByDescending(o => o.CreatedAt);
            var total = await query.CountAsync();
            var items = await query.Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { items, total, page, pageSize });
        }

        [HttpPost]
        public async Task<IActionResult> AddOrder([FromBody] Order order)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Kullanıcı gerçekten var mı kontrol et
            var userExists = await _context.Users.AnyAsync(u => u.Id == order.UserId);
            if (!userExists)
                return BadRequest(new { message = "Geçerli bir kullanıcı seçmelisiniz." });
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return Ok(order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] Order order)
        {
            var dbOrder = await _context.Orders.FindAsync(id);
            if (dbOrder == null) return NotFound();
            dbOrder.OrderNumber = order.OrderNumber;
            dbOrder.UserId = order.UserId;
            dbOrder.Total = order.Total;
            await _context.SaveChangesAsync();
            return Ok(dbOrder);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var dbOrder = await _context.Orders.FindAsync(id);
            if (dbOrder == null) return NotFound();
            _context.Orders.Remove(dbOrder);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
} 