using System.Text.Json.Serialization;

namespace TaskManagerApi.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; } // Bitiş tarihi
        public string Priority { get; set; } = "medium"; // Öncelik: low, medium, high
        public bool IsCompleted { get; set; }
        public bool IsOverdue { get; set; } = false; // Gecikme durumu
        public string Status { get; set; } = "pending"; // Status: pending, approved, rejected, completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Oluşturulma tarihi
        public DateTime? CompletedAt { get; set; } // Tamamlanma tarihi
        public DateTime? ApprovedAt { get; set; } // Onaylanma tarihi
        public int? ApprovedBy { get; set; } // Onaylayan kullanıcı ID
        public int UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; } = null;
        [JsonIgnore]
        public User? Approver { get; set; } = null; // Navigation property for approver
    }
} 