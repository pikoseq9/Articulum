using Articulum.Domain;
using Articulum.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Articulum.Application.Articles
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required Article Article { get; set; }
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

                // Aktualizacja pól zgodnie z Twoim modelem Domain.Article
                article.Title = request.Article.Title ?? article.Title;
                article.Authors = request.Article.Authors ?? article.Authors;
                article.PageRange = request.Article.PageRange ?? article.PageRange;
                article.Category = request.Article.Category;
                article.PdfFileName = request.Article.PdfFileName ?? article.PdfFileName;
                article.AdditionalFileName = request.Article.AdditionalFileName ?? article.AdditionalFileName;

                // Jeśli data publikacji została przesłana (różna od domyślnej), aktualizujemy
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