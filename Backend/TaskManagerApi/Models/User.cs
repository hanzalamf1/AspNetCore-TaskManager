using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManagerApi.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required, MinLength(3), MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        [Required, MinLength(6), MaxLength(255)]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        [Required, MaxLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;
        public int RemainingDays { get; set; } = 30; // Varsayılan başlangıç değeri
        public DateTime? LastDecrementDate { get; set; } // Son eksiltme tarihi
        public string Role { get; set; } = "user"; // user, admin
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Hesap oluşturulma tarihi
        public DateTime? LastLoginAt { get; set; } // Son giriş tarihi
        [JsonIgnore]
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        [JsonIgnore]
        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    }
} 