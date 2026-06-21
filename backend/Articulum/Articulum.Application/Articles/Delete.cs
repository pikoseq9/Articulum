using Articulum.Application;
using Articulum.Domain;
using Articulum.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Articulum.Application.Articles
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var article = await _context.Articles
                    .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

                if (article == null)
                    return Result<Unit>.Failure("Nie znaleziono artykułu lub brak uprawnień do usunięcia");

                var fileNameToDelete = article.PdfFileName;
                var additionalFileNameToDelete = article.AdditionalFileName;

                _context.Remove(article);
                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!result)
                    return Result<Unit>.Failure("Nie udało się usunąć artykułu z bazy danych");

                if (!string.IsNullOrEmpty(fileNameToDelete))
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/pdfs", fileNameToDelete);
                    if (System.IO.File.Exists(filePath))
                    {
                        try { System.IO.File.Delete(filePath); }
                        catch (Exception ex) { Console.WriteLine($"Błąd podczas usuwania pliku PDF: {ex.Message}"); }
                    }
                }

                if (!string.IsNullOrEmpty(additionalFileNameToDelete))
                {
                    var additionalFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/additional", additionalFileNameToDelete);
                    if (System.IO.File.Exists(additionalFilePath))
                    {
                        try { System.IO.File.Delete(additionalFilePath); }
                        catch (Exception ex) { Console.WriteLine($"Błąd podczas usuwania pliku dodatkowego: {ex.Message}"); }
                    }
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}