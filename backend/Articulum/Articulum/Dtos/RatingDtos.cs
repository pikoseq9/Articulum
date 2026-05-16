namespace Articulum.Dtos
{
    // To co przychodzi z Frontendu (RatingForm)
    public class CreateRatingDto
    {
        public string BookTitle { get; set; }
        public string BookAuthor { get; set; }
        public string? BookCover { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }

    // To co wysyłamy na Frontend (RatingWall)
    public class RatingDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string UserAvatarInitials { get; set; } // np. "JK"
        public string? UserAvatarUrl { get; set; }

        public string BookTitle { get; set; }
        public string BookAuthor { get; set; }
        public string? BookCover { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Flaga czy to ocena aktualnie zalogowanego usera (do usuwania)
        public bool IsMine { get; set; }
    }
}