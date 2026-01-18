namespace Books.Domain
{
    public class UserBook
    {
        public Guid Id { get; set; }

        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }

        public string Title { get; set; }
        public string Author { get; set; }
        public string Isbn { get; set; }
        public string ImageUrl { get; set; }
        public string Description { get; set; }
        public int? Pages { get; set; }

        // Status książki: np. 0 - Do przeczytania, 1 - W trakcie, 2 - Przeczytane
        public BookStatus Status { get; set; } = BookStatus.ToRead;
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }

    public enum BookStatus
    {
        ToRead,
        Reading,
        Read
    }
}
