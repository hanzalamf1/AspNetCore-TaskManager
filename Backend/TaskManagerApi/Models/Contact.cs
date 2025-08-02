using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManagerApi.Models
{
    public class Contact
    {
        public int Id { get; set; }
        
        [Required, MinLength(2), MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required, MinLength(10), MaxLength(20)]
        public string Phone { get; set; } = string.Empty;
        
        [Required, MinLength(10), MaxLength(500)]
        public string Subject { get; set; } = string.Empty;
        
        [Required, MinLength(20), MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
        
        public string Status { get; set; } = "pending"; // pending, read, replied, closed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        public DateTime? RepliedAt { get; set; }
        public string? ReplyMessage { get; set; }
        public int? RepliedByUserId { get; set; }
        [JsonIgnore]
        public User? RepliedByUser { get; set; }
        public string? AdminNotes { get; set; }
        public int Priority { get; set; } = 1; // 1: Low, 2: Medium, 3: High, 4: Urgent
    }
} 