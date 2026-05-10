using Articulum.Domain;
using Articulum.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Articulum.Application.Articles
{
    public class Edit
    {
        public static string GetCategoryPrefix(ArticleCategory category) => category switch
        {
            ArticleCategory.Mathematics => "M",
            ArticleCategory.ComputerScience => "I",
            ArticleCategory.Didactics => "D",
            ArticleCategory.PopularScience => "P",
            _ => throw new ArgumentOutOfRangeException(nameof(category))
        };

        public class Command : IRequest<Result<Unit>>
        {
            public required Article Article { get; set; }
            public IFormFile? File { get; set; }
            public IFormFile? AdditionalFile { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var article = await _context.Articles
                    .FirstOrDefaultAsync(x => x.Id == request.Article.Id, cancellationToken);

                if (article == null)
                    return Result<Unit>.Failure("Nie znaleziono artykułu do edycji");

                const long MaxPdfSize = 20 * 1024 * 1024; // 20 MB
                const long MaxAdditionalSize = 50 * 1024 * 1024; // 50 MB

                if (request.File != null)
                {
                    if (request.File.ContentType != "application/pdf")
                        return Result<Unit>.Failure("Dozwolone są wyłącznie pliki w formacie PDF.");

                    if (request.File.Length > MaxPdfSize)
                        return Result<Unit>.Failure("Rozmiar pliku PDF przekracza limit 20 MB.");

                    if (!string.IsNullOrEmpty(article.PdfFileName))
                    {
                        var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/pdfs", article.PdfFileName);
                        if (System.IO.File.Exists(oldPath))
                            System.IO.File.Delete(oldPath);
                    }

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

                    article.PdfFileName = fileName;
                }

                if (request.AdditionalFile != null)
                {
                    if (request.AdditionalFile.Length > MaxAdditionalSize)
                        return Result<Unit>.Failure("Rozmiar pliku dodatkowego przekracza limit 50 MB.");

                    var extension = Path.GetExtension(request.AdditionalFile.FileName).ToLower();
                    var forbiddenExtensions = new[] { ".exe", ".sh", ".bat", ".cmd", ".js" };
                    if (forbiddenExtensions.Contains(extension))
                        return Result<Unit>.Failure("Niedozwolony typ pliku dodatkowego.");

                    if (!string.IsNullOrEmpty(article.AdditionalFileName))
                    {
                        var oldAdditionalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/additional", article.AdditionalFileName);
                        if (System.IO.File.Exists(oldAdditionalPath))
                            System.IO.File.Delete(oldAdditionalPath);
                    }

                    var additionalFileName = $"{Guid.NewGuid()}{extension}";
                    var additionalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/additional", additionalFileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(additionalPath)!);

                    using var additionalStream = new FileStream(additionalPath, FileMode.Create);
                    await request.AdditionalFile.CopyToAsync(additionalStream, cancellationToken);

                    article.AdditionalFileName = additionalFileName;
                }

                article.Title = request.Article.Title ?? article.Title;
                article.Authors = request.Article.Authors ?? article.Authors;
                article.PageRange = request.Article.PageRange ?? article.PageRange;
                article.Category = request.Article.Category;
                article.Keywords = request.Article.Keywords ?? article.Keywords;

                if (request.Article.PublicationDate != default)
                    article.PublicationDate = request.Article.PublicationDate;

                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                return Result<Unit>.Success(Unit.Value);
            }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Article.Title).NotEmpty();
                RuleFor(x => x.Article.Authors).NotEmpty();
            }
        }
    }
}