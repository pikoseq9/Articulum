using MediatR;
using Articulum.Domain;
using Articulum.Infrastructure;
using FluentValidation;

namespace Articulum.Application.Articles
{
    public class Add
    {
        public class Command : IRequest<Result<Article>>
        {
            public required Article Article { get; set; }
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
                if (request.Article.Id == Guid.Empty)
                    request.Article.Id = Guid.NewGuid();

                // Ustawiamy datę publikacji na teraz, jeśli nie podano innej
                if (request.Article.PublicationDate == default)
                    request.Article.PublicationDate = DateTime.UtcNow;

                _context.Articles.Add(request.Article);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                    return Result<Article>.Failure("Błąd podczas zapisywania artykułu");

                return Result<Article>.Success(request.Article);
            }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Article.Title).NotEmpty();
                RuleFor(x => x.Article.Authors).NotEmpty();
                RuleFor(x => x.Article.PdfFileName).NotEmpty().WithMessage("Nazwa pliku PDF jest wymagana");
            }
        }
    }
}