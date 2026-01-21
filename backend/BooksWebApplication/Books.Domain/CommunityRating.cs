using System.ComponentModel.DataAnnotations;

namespace Books.Domain
{
    public class CommunityRating
    {
        public Guid Id { get; set; }
        public string AppUserId { get; set; } = null!;
        public AppUser AppUser { get; set; } = null!;

        [Required]
        public string BookTitle { get; set; } = string.Empty;
        [Required]
        public string BookAuthor { get; set; } = string.Empty;
        public string? BookCover { get; set; }
        [Range(1, 5)]
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}