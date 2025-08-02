using System;

namespace TaskManagerApi.Models
{
    public class Button
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
        public decimal Price { get; set; }
    }
} 