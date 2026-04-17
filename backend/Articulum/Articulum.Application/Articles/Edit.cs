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
                var book = await _context.Books
                    .FirstOrDefaultAsync(x => x.Id == request.UserBook.Id &&
                                              x.AppUser.UserName == _userAccessor.GetUsername(),
                                         cancellationToken);

                if (book == null)
                    return Result<Unit>.Failure("Nie znaleziono książki lub brak uprawnień do edycji");

                // Aktualizacja standardowych pól
                book.Title = request.UserBook.Title ?? book.Title;
                book.Author = request.UserBook.Author ?? book.Author;
                book.Isbn = request.UserBook.Isbn ?? book.Isbn;
                book.ImageUrl = request.UserBook.ImageUrl ?? book.ImageUrl;
                book.Description = request.UserBook.Description ?? book.Description;
                book.Pages = request.UserBook.Pages ?? book.Pages;
                book.Status = request.UserBook.Status;

                if (request.UserBook.AddedAt != default(DateTime))
                {
                    book.AddedAt = request.UserBook.AddedAt;
                }

                // NOWE POLA:
                book.Subject = request.UserBook.Subject ?? book.Subject;
                book.CurrentPage = request.UserBook.CurrentPage ?? book.CurrentPage;

                // Opcjonalna logika: Jeśli użytkownik zaczął czytać, zmień status na "Reading"
                if (book.CurrentPage > 0 && book.CurrentPage < book.Pages && book.Status == BookStatus.ToRead)
                {
                    book.Status = BookStatus.Reading;
                }

                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                // Zwracamy Success nawet jeśli result == 0, 
                // bo jeśli użytkownik nic nie zmienił w polach i kliknął "Zapisz", 
                // SaveChanges zwróci 0, ale to nie jest błąd aplikacji.
                return Result<Unit>.Success(Unit.Value);
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