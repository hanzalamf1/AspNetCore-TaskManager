using Microsoft.AspNetCore.Mvc;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SliderController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetSliderData()
        {
            var sliderData = new[]
            {
                new
                {
                    id = 1,
                    title = "Görev Yönetiminde Yeni Dönem",
                    description = "Task Manager ile görevlerinizi kolayca organize edin, takip edin ve tamamlayın. Verimliliğinizi artırın!",
                    buttonText = "Hemen Başla",
                    buttonLink = "#",
                    imageUrl = "",
                    backgroundColor = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                },
                new
                {
                    id = 2,
                    title = "Akıllı Dashboard",
                    description = "Gerçek zamanlı istatistikler ve görsel grafiklerle performansınızı analiz edin. Hedeflerinize ulaşın!",
                    buttonText = "Dashboard'u Keşfet",
                    buttonLink = "#",
                    imageUrl = "",
                    backgroundColor = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                },
                new
                {
                    id = 3,
                    title = "Takvim Entegrasyonu",
                    description = "Görevlerinizi takvim görünümünde planlayın. Hiçbir önemli tarihi kaçırmayın!",
                    buttonText = "Takvimi Görüntüle",
                    buttonLink = "#",
                    imageUrl = "",
                    backgroundColor = "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                },
                new
                {
                    id = 4,
                    title = "Veri Yönetimi",
                    description = "Görevlerinizi farklı formatlarda dışa aktarın ve yedekleyin. Verileriniz güvende!",
                    buttonText = "Dışa Aktar",
                    buttonLink = "#",
                    imageUrl = "",
                    backgroundColor = "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                },
                new
                {
                    id = 5,
                    title = "Mobil Uyumlu",
                    description = "Tüm cihazlarda mükemmel deneyim. Mobil, tablet ve masaüstü uyumlu tasarım!",
                    buttonText = "Mobilde Dene",
                    buttonLink = "#",
                    imageUrl = "",
                    backgroundColor = "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                }
            };

            return Ok(sliderData);
        }
    }
} 