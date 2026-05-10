public class ArticleCreateDto
{
    public string Title { get; set; }
    public string Authors { get; set; }
    public string PageRange { get; set; }
    public string Category { get; set; }
    public IFormFile PdfFile { get; set; }
    public DateTime PublicationDate { get; set; }
    public IFormFile? AdditionalFile { get; set; } = null;
}