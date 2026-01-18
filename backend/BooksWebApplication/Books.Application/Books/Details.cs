using MediatR;
using Books.Domain;
using Books.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Books.Application.Books
{
    public class Details
    {
        public class Query : IRequest<Result<UserBook>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<UserBook>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor; // 1. Dodajemy pole prywatne

            // 2. Wstrzykujemy IUserAccessor w konstruktorze
            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            // 3. Metoda Handle musi mieć TYLKO 2 parametry
            public async Task<Result<UserBook>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Szukamy książki, sprawdzając czy ID się zgadza ORAZ czy należy do zalogowanego użytkownika
                var book = await _context.Books
                    .FirstOrDefaultAsync(x => x.Id == request.Id &&
                                              x.AppUser.UserName == _userAccessor.GetUsername(),
                                         cancellationToken);

                if (book == null)
                    return Result<UserBook>.Failure("Nie znaleziono książki lub nie masz do niej uprawnień");

                return Result<UserBook>.Success(book);
            }
        }
    }
}