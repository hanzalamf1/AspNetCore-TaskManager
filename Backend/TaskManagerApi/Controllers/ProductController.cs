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
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProductController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetProducts(int page = 1, int pageSize = 20)
        {
            var query = _context.Products.OrderByDescending(p => p.CreatedAt);
            var total = await query.CountAsync();
            var items = await query.Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { items, total, page, pageSize });
        }

        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            var dbProduct = await _context.Products.FindAsync(id);
            if (dbProduct == null) return NotFound();
            dbProduct.Name = product.Name;
            dbProduct.Category = product.Category;
            dbProduct.Stock = product.Stock;
            await _context.SaveChangesAsync();
            return Ok(dbProduct);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var dbProduct = await _context.Products.FindAsync(id);
            if (dbProduct == null) return NotFound();
            _context.Products.Remove(dbProduct);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
} 