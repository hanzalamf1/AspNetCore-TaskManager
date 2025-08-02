using System;

namespace TaskManagerApi.Models
{
    public class Laptop
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Model { get; set; }
        public string Color { get; set; }
        public string CPU { get; set; }
        public decimal Price { get; set; }
    }
} 