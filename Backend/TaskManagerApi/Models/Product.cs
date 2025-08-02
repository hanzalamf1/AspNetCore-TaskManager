using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models
{
    public class Product
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;
        public int Stock { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 