using MediatR;
using Books.Infrastructure;
using Books.Domain;
using Microsoft.EntityFrameworkCore;

namespace Books.Application.Books
{
    public class List
    {
        public class Query : IRequest<Result<List<UserBook>>> { }

        public class Handler : IRequestHandler<Query, Result<List<UserBook>>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor) // Wstrzyknij accessor
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Result<List<UserBook>>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Filtrujemy po UserName zalogowanego użytkownika
                var result = await _context.Books
                    .Where(x => x.AppUser.UserName == _userAccessor.GetUsername())
                    .ToListAsync();

                return Result<List<UserBook>>.Success(result);
            }
        }

    }
}
