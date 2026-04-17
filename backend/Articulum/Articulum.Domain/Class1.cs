using System;

namespace Articulum.Domain
{
    public enum BookStatus
    {
        ToRead = 0,
        Reading = 1,
        Finished = 2
    }

    public class UserBook
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Isbn { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public BookStatus Status { get; set; }
        public DateTime AddedAt { get; set; }
        public int? Pages { get; set; }
        public int? CurrentPage { get; set; }
        public string? Subject { get; set; }

        // Relations
        public string? AppUserId { get; set; }
        public AppUser? AppUser { get; set; }
    }
}
