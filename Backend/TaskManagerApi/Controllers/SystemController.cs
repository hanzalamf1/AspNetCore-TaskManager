using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class SystemController : ControllerBase
    {
        // Bildirim ve rapor fonksiyonları kaldırıldı. Gerekirse controller tamamen silinebilir.
    }
} 