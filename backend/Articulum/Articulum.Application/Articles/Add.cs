using MediatR;
using Articulum.Domain;
using Microsoft.AspNetCore.Http;
using Articulum.Infrastructure;
using FluentValidation;

namespace Articulum.Application.Articles
{
    public class Add
    {
        public class Command : IRequest<Result<Article>>
        {
            public required Article Article { get; set; }
            public IFormFile? File { get; set; } // Dodajemy to pole
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
                // 1. Logika zapisu pliku na dysk
                if (request.File != null)
                {
                    var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
                    var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/pdfs", fileName);

                    // Upewnij się, że folder istnieje
                    Directory.CreateDirectory(Path.GetDirectoryName(path)!);

                    using var stream = new FileStream(path, FileMode.Create);
                    await request.File.CopyToAsync(stream, cancellationToken);

                    // Przypisujemy nazwę pliku do modelu
                    request.Article.PdfFileName = fileName;
                }

                if (request.Article.Id == Guid.Empty)
                    request.Article.Id = Guid.NewGuid();

                _context.Articles.Add(request.Article);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                return success
                    ? Result<Article>.Success(request.Article)
                    : Result<Article>.Failure("Błąd podczas zapisywania w bazie");
            }
        }
    }
}