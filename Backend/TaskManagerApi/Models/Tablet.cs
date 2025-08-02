using System;

namespace TaskManagerApi.Models
{
    public class Tablet
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string Model { get; set; }
        public string Color { get; set; }
        public string Screen { get; set; }
        public decimal Price { get; set; }
    }
} 