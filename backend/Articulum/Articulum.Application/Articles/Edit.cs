using Articulum.Domain;
using Articulum.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http; // Potrzebne do IFormFile

namespace Articulum.Application.Articles
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required Article Article { get; set; }
            public IFormFile? File { get; set; } // Opcjonalny nowy plik
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

                // --- LOGIKA OBSŁUGI PLIKU ---
                if (request.File != null)
                {
                    // Usuń stary plik z dysku, jeśli istnieje
                    if (!string.IsNullOrEmpty(article.PdfFileName))
                    {
                        var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/pdfs", article.PdfFileName);
                        if (System.IO.File.Exists(oldPath))
                            System.IO.File.Delete(oldPath);
                    }

                    var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
                    var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/pdfs", fileName);

                    using var stream = new FileStream(path, FileMode.Create);
                    await request.File.CopyToAsync(stream, cancellationToken);

                    article.PdfFileName = fileName;
                }

                article.Title = request.Article.Title ?? article.Title;
                article.Authors = request.Article.Authors ?? article.Authors;
                article.PageRange = request.Article.PageRange ?? article.PageRange;
                article.Category = request.Article.Category;
                article.AdditionalFileName = request.Article.AdditionalFileName ?? article.AdditionalFileName;

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