using System;

namespace Articulum.Domain
{
    public enum ArticleCategory
    {
        Mathematics = 1,
        ComputerScience = 2,
        Didactics = 3,
        PopularScience = 4
    }

    public class Article
    {
        public Guid Id { get; set; }

        public string Title { get; set; }
        public string Authors { get; set; }
        public string PageRange { get; set; }

        public DateTime PublicationDate { get; set; }

        public ArticleCategory Category { get; set; }

        public string PdfFileName { get; set; }
        public string? AdditionalFileName { get; set; }

        public int OpenCount { get; set; }

        // Relations
        public string? AppUserId { get; set; }
        public AppUser? AppUser { get; set; }
    }
}
