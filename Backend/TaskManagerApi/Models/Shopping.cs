using System;

namespace TaskManagerApi.Models
{
    public class Shopping
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Status { get; set; }
        public decimal Price { get; set; }
    }
} 