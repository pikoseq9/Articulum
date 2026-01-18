using MediatR;
using Books.Domain;
using Books.Infrastructure;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using System;

namespace Books.Application.Books
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
                _context.Books.Add(request.UserBook);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                {
                    return Result<UserBook>.Failure("Nie udało się zapisać samochodu do bazy danych");
                    // Zwracamy obiekt, który faktycznie został utworzony (z Id)
                    
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