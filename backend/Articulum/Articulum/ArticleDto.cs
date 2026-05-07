public class ArticleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Authors { get; set; }
    public string PageRange { get; set; }
    public DateTime PublicationDate { get; set; }
    public string Category { get; set; }
    public int OpenCount { get; set; }
}