using MediatR;
using Articulum.Domain;
using Microsoft.AspNetCore.Http;
using Articulum.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Articulum.Application.Articles
{
    public class Add
    {
        public static string GetCategoryPrefix(ArticleCategory category) => category switch
        {
            ArticleCategory.Mathematics => "M",
            ArticleCategory.ComputerScience => "I",
            ArticleCategory.Didactics => "D",
            ArticleCategory.PopularScience => "P",
            _ => throw new ArgumentOutOfRangeException(nameof(category))
        };

        public class Command : IRequest<Result<Article>>
        {
            public required Article Article { get; set; }
            public IFormFile? File { get; set; }
            public IFormFile? AdditionalFile { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Article>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Article>> Handle(Command request, CancellationToken cancellationToken)
            {
                const long MaxPdfSize = 20 * 1024 * 1024; // 20 MB
                const long MaxAdditionalSize = 50 * 1024 * 1024; // 50 MB

                if (request.File != null)
                {
                    if (request.File.ContentType != "application/pdf")
                        return Result<Article>.Failure("Dozwolone są wyłącznie pliki w formacie PDF.");

                    if (request.File.Length > MaxPdfSize)
                        return Result<Article>.Failure("Rozmiar pliku PDF przekracza dopuszczalny limit 20 MB.");
                }

                if (request.AdditionalFile != null)
                {
                    if (request.AdditionalFile.Length > MaxAdditionalSize)
                        return Result<Article>.Failure("Rozmiar pliku dodatkowego przekracza dopuszczalny limit 50 MB.");

                    var extension = Path.GetExtension(request.AdditionalFile.FileName).ToLower();
                    var forbiddenExtensions = new[] { ".exe", ".sh", ".bat", ".cmd", ".js" };
                    if (forbiddenExtensions.Contains(extension))
                    {
                        return Result<Article>.Failure("Niedozwolony typ pliku dodatkowego.");
                    }
                }

                if (request.Article.Id == Guid.Empty)
                    request.Article.Id = Guid.NewGuid();

                if (request.File != null)
                {
                    string prefix = GetCategoryPrefix(request.Article.Category);
                    string year = request.Article.PublicationDate.ToString("yy");
                    int fullYear = request.Article.PublicationDate.Year;

                    int currentCount = await _context.Articles
                        .Where(a => a.Category == request.Article.Category && a.PublicationDate.Year == fullYear)
                        .CountAsync(cancellationToken);

                    string number = (currentCount + 1).ToString("D3");

                    var fileName = $"{prefix}-{year}-{number}.pdf";
                    var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/pdfs", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(path)!);

                    using var stream = new FileStream(path, FileMode.Create);
                    await request.File.CopyToAsync(stream, cancellationToken);

                    request.Article.PdfFileName = fileName;
                }

                if (request.AdditionalFile != null)
                {
                    var extension = Path.GetExtension(request.AdditionalFile.FileName).ToLower();
                    var additionalFileName = $"{Guid.NewGuid()}{extension}";
                    var additionalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/additional", additionalFileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(additionalPath)!);

                    using var additionalStream = new FileStream(additionalPath, FileMode.Create);
                    await request.AdditionalFile.CopyToAsync(additionalStream, cancellationToken);

                    request.Article.AdditionalFileName = additionalFileName;
                }

                _context.Articles.Add(request.Article);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                return success
                    ? Result<Article>.Success(request.Article)
                    : Result<Article>.Failure("Błąd podczas zapisywania w bazie");
            }
        }
    }
}