using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagerApi.Models
{
    public class Order
    {
        public int Id { get; set; }
        [Required, MaxLength(30)]
        public string OrderNumber { get; set; } = string.Empty;
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }
        public decimal Total { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 