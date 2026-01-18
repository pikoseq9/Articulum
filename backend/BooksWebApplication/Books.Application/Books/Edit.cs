using Books.Domain;
using Books.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.Application.Books
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>> // Zmieniono na Result dla spójności błędów
        {
            public required UserBook UserBook { get; set; }
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
                // Szukamy książki sprawdzając ID oraz czy należy do zalogowanego użytkownika
                var book = await _context.Books
                    .FirstOrDefaultAsync(x => x.Id == request.UserBook.Id &&
                                              x.AppUser.UserName == _userAccessor.GetUsername(),
                                         cancellationToken);

                if (book == null)
                    return Result<Unit>.Failure("Nie znaleziono książki lub brak uprawnień do edycji");

                // Aktualizacja pól
                book.Title = request.UserBook.Title ?? book.Title;
                book.Author = request.UserBook.Author ?? book.Author;
                book.Isbn = request.UserBook.Isbn ?? book.Isbn;
                book.ImageUrl = request.UserBook.ImageUrl ?? book.ImageUrl;
                book.Description = request.UserBook.Description ?? book.Description;
                book.Status = request.UserBook.Status;

                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                return result
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Wystąpił błąd podczas aktualizacji bazy danych");
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