using MediatR;
using Articulum.Domain;
using Articulum.Infrastructure;
using FluentValidation;

namespace Articulum.Application.Articles
{
    public class Add
    {
        public class Command : IRequest<Result<UserBook>>
        {
            public required UserBook UserBook { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<UserBook>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<UserBook>> Handle(Command request, CancellationToken cancellationToken)
            {
                if (request.UserBook.Id == Guid.Empty) request.UserBook.Id = Guid.NewGuid();
                if (request.UserBook.AddedAt == default) request.UserBook.AddedAt = DateTime.UtcNow;

                _context.Books.Add(request.UserBook);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                {
                    return Result<UserBook>.Failure("Nie udało się zapisać książki do bazy danych");
                }

                return Result<UserBook>.Success(request.UserBook);
            }

            public class CommandValidator : AbstractValidator<Command>
            {
                public CommandValidator()
                {
                    RuleFor(x => x.UserBook).SetValidator(new BooksValidator());
                }
            }
        }
    }
}