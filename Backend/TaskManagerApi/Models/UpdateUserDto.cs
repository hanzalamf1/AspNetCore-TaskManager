namespace TaskManagerApi.Models
{
    public class UpdateUserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string? Password { get; set; } // opsiyonel
        public int? RemainingDays { get; set; } // opsiyonel kalan gün
        public string? Role { get; set; } // opsiyonel rol
    }
} 