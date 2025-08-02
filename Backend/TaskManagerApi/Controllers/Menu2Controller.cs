using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using TaskManagerApi.Models;
using TaskManagerApi.Models.Data;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/menu2/[action]")]
    public class Menu2Controller : ControllerBase
    {
        private readonly AppDbContext _context;
        public Menu2Controller(AppDbContext context) { _context = context; }

        // BUTTON
        [HttpGet]
        public async Task<IActionResult> GetButtons() => Ok(await _context.Buttons.ToListAsync());
        [HttpGet]
        public async Task<IActionResult> GetButton(int id) {
            var item = await _context.Buttons.FindAsync(id);
            return item == null ? NotFound() : Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> AddButton([FromBody] Button b) {
            _context.Buttons.Add(b); await _context.SaveChangesAsync(); return Ok(b);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateButton([FromBody] Button b) {
            if (!_context.Buttons.Any(x => x.Id == b.Id)) return NotFound();
            _context.Buttons.Update(b); await _context.SaveChangesAsync(); return Ok(b);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteButton(int id) {
            var item = await _context.Buttons.FindAsync(id); if (item == null) return NotFound();
            _context.Buttons.Remove(item); await _context.SaveChangesAsync(); return Ok();
        }

        // LAPTOP
        [HttpGet]
        public async Task<IActionResult> GetLaptops() => Ok(await _context.Laptops.ToListAsync());
        [HttpGet]
        public async Task<IActionResult> GetLaptop(int id) {
            var item = await _context.Laptops.FindAsync(id);
            return item == null ? NotFound() : Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> AddLaptop([FromBody] Laptop l) {
            _context.Laptops.Add(l); await _context.SaveChangesAsync(); return Ok(l);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateLaptop([FromBody] Laptop l) {
            if (!_context.Laptops.Any(x => x.Id == l.Id)) return NotFound();
            _context.Laptops.Update(l); await _context.SaveChangesAsync(); return Ok(l);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteLaptop(int id) {
            var item = await _context.Laptops.FindAsync(id); if (item == null) return NotFound();
            _context.Laptops.Remove(item); await _context.SaveChangesAsync(); return Ok();
        }

        // TABLET
        [HttpGet]
        public async Task<IActionResult> GetTablets() => Ok(await _context.Tablets.ToListAsync());
        [HttpGet]
        public async Task<IActionResult> GetTablet(int id) {
            var item = await _context.Tablets.FindAsync(id);
            return item == null ? NotFound() : Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> AddTablet([FromBody] Tablet t) {
            _context.Tablets.Add(t); await _context.SaveChangesAsync(); return Ok(t);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateTablet([FromBody] Tablet t) {
            if (!_context.Tablets.Any(x => x.Id == t.Id)) return NotFound();
            _context.Tablets.Update(t); await _context.SaveChangesAsync(); return Ok(t);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteTablet(int id) {
            var item = await _context.Tablets.FindAsync(id); if (item == null) return NotFound();
            _context.Tablets.Remove(item); await _context.SaveChangesAsync(); return Ok();
        }

        // CAR
        [HttpGet]
        public async Task<IActionResult> GetCars() => Ok(await _context.Cars.ToListAsync());
        [HttpGet]
        public async Task<IActionResult> GetCar(int id) {
            var item = await _context.Cars.FindAsync(id);
            return item == null ? NotFound() : Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> AddCar([FromBody] Car c) {
            _context.Cars.Add(c); await _context.SaveChangesAsync(); return Ok(c);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateCar([FromBody] Car c) {
            if (!_context.Cars.Any(x => x.Id == c.Id)) return NotFound();
            _context.Cars.Update(c); await _context.SaveChangesAsync(); return Ok(c);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteCar(int id) {
            var item = await _context.Cars.FindAsync(id); if (item == null) return NotFound();
            _context.Cars.Remove(item); await _context.SaveChangesAsync(); return Ok();
        }

        // PHONE
        [HttpGet]
        public async Task<IActionResult> GetPhones() => Ok(await _context.Phones.ToListAsync());
        [HttpGet]
        public async Task<IActionResult> GetPhone(int id) {
            var item = await _context.Phones.FindAsync(id);
            return item == null ? NotFound() : Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> AddPhone([FromBody] Phone p) {
            _context.Phones.Add(p); await _context.SaveChangesAsync(); return Ok(p);
        }
        [HttpPut]
        public async Task<IActionResult> UpdatePhone([FromBody] Phone p) {
            if (!_context.Phones.Any(x => x.Id == p.Id)) return NotFound();
            _context.Phones.Update(p); await _context.SaveChangesAsync(); return Ok(p);
        }
        [HttpDelete]
        public async Task<IActionResult> DeletePhone(int id) {
            var item = await _context.Phones.FindAsync(id); if (item == null) return NotFound();
            _context.Phones.Remove(item); await _context.SaveChangesAsync(); return Ok();
        }

        // SHOPPING
        [HttpGet]
        public async Task<IActionResult> GetShoppings() => Ok(await _context.Shoppings.ToListAsync());
        [HttpGet]
        public async Task<IActionResult> GetShopping(int id) {
            var item = await _context.Shoppings.FindAsync(id);
            return item == null ? NotFound() : Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> AddShopping([FromBody] Shopping s) {
            _context.Shoppings.Add(s); await _context.SaveChangesAsync(); return Ok(s);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateShopping([FromBody] Shopping s) {
            if (!_context.Shoppings.Any(x => x.Id == s.Id)) return NotFound();
            _context.Shoppings.Update(s); await _context.SaveChangesAsync(); return Ok(s);
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteShopping(int id) {
            var item = await _context.Shoppings.FindAsync(id); if (item == null) return NotFound();
            _context.Shoppings.Remove(item); await _context.SaveChangesAsync(); return Ok();
        }

        // --- Gelişmiş Query Endpointleri ---
        [HttpGet]
        public async Task<IActionResult> QueryButtons([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string[] color = null, [FromQuery] string[] type = null, [FromQuery] string name = null, [FromQuery] decimal? priceMin = null, [FromQuery] decimal? priceMax = null)
        {
            var q = _context.Buttons.AsQueryable();
            if (color != null && color.Length > 0) q = q.Where(x => color.Contains(x.Color));
            if (type != null && type.Length > 0) q = q.Where(x => type.Contains(x.Type));
            if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.Contains(name));
            if (priceMin.HasValue) q = q.Where(x => x.Price >= priceMin.Value);
            if (priceMax.HasValue) q = q.Where(x => x.Price <= priceMax.Value);
            var total = await q.CountAsync();
            var data = await q.OrderByDescending(x => x.Date).Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { data, total });
        }
        [HttpGet]
        public async Task<IActionResult> QueryLaptops([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string[] color = null, [FromQuery] string[] cpu = null, [FromQuery] string[] model = null, [FromQuery] string name = null, [FromQuery] decimal? priceMin = null, [FromQuery] decimal? priceMax = null)
        {
            var q = _context.Laptops.AsQueryable();
            if (color != null && color.Length > 0) q = q.Where(x => color.Contains(x.Color));
            if (cpu != null && cpu.Length > 0) q = q.Where(x => cpu.Contains(x.CPU));
            if (model != null && model.Length > 0) q = q.Where(x => model.Contains(x.Model));
            if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.Contains(name));
            if (priceMin.HasValue) q = q.Where(x => x.Price >= priceMin.Value);
            if (priceMax.HasValue) q = q.Where(x => x.Price <= priceMax.Value);
            var total = await q.CountAsync();
            var data = await q.OrderByDescending(x => x.Date).Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { data, total });
        }
        [HttpGet]
        public async Task<IActionResult> QueryTablets([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string[] color = null, [FromQuery] string[] screen = null, [FromQuery] string[] model = null, [FromQuery] string name = null, [FromQuery] decimal? priceMin = null, [FromQuery] decimal? priceMax = null)
        {
            var q = _context.Tablets.AsQueryable();
            if (color != null && color.Length > 0) q = q.Where(x => color.Contains(x.Color));
            if (screen != null && screen.Length > 0) q = q.Where(x => screen.Contains(x.Screen));
            if (model != null && model.Length > 0) q = q.Where(x => model.Contains(x.Model));
            if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.Contains(name));
            if (priceMin.HasValue) q = q.Where(x => x.Price >= priceMin.Value);
            if (priceMax.HasValue) q = q.Where(x => x.Price <= priceMax.Value);
            var total = await q.CountAsync();
            var data = await q.OrderByDescending(x => x.Date).Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { data, total });
        }
        [HttpGet]
        public async Task<IActionResult> QueryCars([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string[] color = null, [FromQuery] int[] year = null, [FromQuery] string[] model = null, [FromQuery] string name = null, [FromQuery] decimal? priceMin = null, [FromQuery] decimal? priceMax = null)
        {
            var q = _context.Cars.AsQueryable();
            if (color != null && color.Length > 0) q = q.Where(x => color.Contains(x.Color));
            if (year != null && year.Length > 0) q = q.Where(x => year.Contains(x.Year));
            if (model != null && model.Length > 0) q = q.Where(x => model.Contains(x.Model));
            if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.Contains(name));
            if (priceMin.HasValue) q = q.Where(x => x.Price >= priceMin.Value);
            if (priceMax.HasValue) q = q.Where(x => x.Price <= priceMax.Value);
            var total = await q.CountAsync();
            var data = await q.OrderByDescending(x => x.Date).Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { data, total });
        }
        [HttpGet]
        public async Task<IActionResult> QueryPhones([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string[] color = null, [FromQuery] string[] storage = null, [FromQuery] string[] model = null, [FromQuery] string name = null, [FromQuery] decimal? priceMin = null, [FromQuery] decimal? priceMax = null)
        {
            var q = _context.Phones.AsQueryable();
            if (color != null && color.Length > 0) q = q.Where(x => color.Contains(x.Color));
            if (storage != null && storage.Length > 0) q = q.Where(x => storage.Contains(x.Storage));
            if (model != null && model.Length > 0) q = q.Where(x => model.Contains(x.Model));
            if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.Contains(name));
            if (priceMin.HasValue) q = q.Where(x => x.Price >= priceMin.Value);
            if (priceMax.HasValue) q = q.Where(x => x.Price <= priceMax.Value);
            var total = await q.CountAsync();
            var data = await q.OrderByDescending(x => x.Date).Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { data, total });
        }
        [HttpGet]
        public async Task<IActionResult> QueryShoppings([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string[] category = null, [FromQuery] string[] status = null, [FromQuery] string name = null, [FromQuery] decimal? priceMin = null, [FromQuery] decimal? priceMax = null)
        {
            var q = _context.Shoppings.AsQueryable();
            if (category != null && category.Length > 0) q = q.Where(x => category.Contains(x.Category));
            if (status != null && status.Length > 0) q = q.Where(x => status.Contains(x.Status));
            if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.Contains(name));
            if (priceMin.HasValue) q = q.Where(x => x.Price >= priceMin.Value);
            if (priceMax.HasValue) q = q.Where(x => x.Price <= priceMax.Value);
            var total = await q.CountAsync();
            var data = await q.OrderByDescending(x => x.Date).Skip((page-1)*pageSize).Take(pageSize).ToListAsync();
            return Ok(new { data, total });
        }

        // --- Dinamik Filtre Seçenekleri ---
        [HttpGet]
        public async Task<IActionResult> GetButtonFilters()
        {
            var colors = await _context.Buttons.Select(x => x.Color).Distinct().ToListAsync();
            var types = await _context.Buttons.Select(x => x.Type).Distinct().ToListAsync();
            var priceMin = await _context.Buttons.MinAsync(x => x.Price);
            var priceMax = await _context.Buttons.MaxAsync(x => x.Price);
            return Ok(new {
                color = new { label = "Renk", options = colors },
                type = new { label = "Tip", options = types },
                price = new { label = "Fiyat", min = priceMin, max = priceMax }
            });
        }
        [HttpGet]
        public async Task<IActionResult> GetLaptopFilters()
        {
            var colors = await _context.Laptops.Select(x => x.Color).Distinct().ToListAsync();
            var cpus = await _context.Laptops.Select(x => x.CPU).Distinct().ToListAsync();
            var models = await _context.Laptops.Select(x => x.Model).Distinct().ToListAsync();
            var priceMin = await _context.Laptops.MinAsync(x => x.Price);
            var priceMax = await _context.Laptops.MaxAsync(x => x.Price);
            return Ok(new {
                color = new { label = "Renk", options = colors },
                cpu = new { label = "İşlemci", options = cpus },
                model = new { label = "Model", options = models },
                price = new { label = "Fiyat", min = priceMin, max = priceMax }
            });
        }
        [HttpGet]
        public async Task<IActionResult> GetTabletFilters()
        {
            var colors = await _context.Tablets.Select(x => x.Color).Distinct().ToListAsync();
            var screens = await _context.Tablets.Select(x => x.Screen).Distinct().ToListAsync();
            var models = await _context.Tablets.Select(x => x.Model).Distinct().ToListAsync();
            var priceMin = await _context.Tablets.MinAsync(x => x.Price);
            var priceMax = await _context.Tablets.MaxAsync(x => x.Price);
            return Ok(new {
                color = new { label = "Renk", options = colors },
                screen = new { label = "Ekran", options = screens },
                model = new { label = "Model", options = models },
                price = new { label = "Fiyat", min = priceMin, max = priceMax }
            });
        }
        [HttpGet]
        public async Task<IActionResult> GetCarFilters()
        {
            var colors = await _context.Cars.Select(x => x.Color).Distinct().ToListAsync();
            var years = await _context.Cars.Select(x => x.Year).Distinct().ToListAsync();
            var models = await _context.Cars.Select(x => x.Model).Distinct().ToListAsync();
            var priceMin = await _context.Cars.MinAsync(x => x.Price);
            var priceMax = await _context.Cars.MaxAsync(x => x.Price);
            return Ok(new {
                color = new { label = "Renk", options = colors },
                year = new { label = "Yıl", options = years },
                model = new { label = "Model", options = models },
                price = new { label = "Fiyat", min = priceMin, max = priceMax }
            });
        }
        [HttpGet]
        public async Task<IActionResult> GetPhoneFilters()
        {
            var colors = await _context.Phones.Select(x => x.Color).Distinct().ToListAsync();
            var storages = await _context.Phones.Select(x => x.Storage).Distinct().ToListAsync();
            var models = await _context.Phones.Select(x => x.Model).Distinct().ToListAsync();
            var priceMin = await _context.Phones.MinAsync(x => x.Price);
            var priceMax = await _context.Phones.MaxAsync(x => x.Price);
            return Ok(new {
                color = new { label = "Renk", options = colors },
                storage = new { label = "Depolama", options = storages },
                model = new { label = "Model", options = models },
                price = new { label = "Fiyat", min = priceMin, max = priceMax }
            });
        }
        [HttpGet]
        public async Task<IActionResult> GetShoppingFilters()
        {
            var categories = await _context.Shoppings.Select(x => x.Category).Distinct().ToListAsync();
            var statuses = await _context.Shoppings.Select(x => x.Status).Distinct().ToListAsync();
            var priceMin = await _context.Shoppings.MinAsync(x => x.Price);
            var priceMax = await _context.Shoppings.MaxAsync(x => x.Price);
            return Ok(new {
                category = new { label = "Kategori", options = categories },
                status = new { label = "Durum", options = statuses },
                price = new { label = "Fiyat", min = priceMin, max = priceMax }
            });
        }
    }
} 