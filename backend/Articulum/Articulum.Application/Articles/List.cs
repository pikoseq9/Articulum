using MediatR;
using Articulum.Infrastructure;
using Articulum.Domain;
using Microsoft.EntityFrameworkCore;

namespace Articulum.Application.Articles
{
    public class List
    {
        public class Query : IRequest<Result<List<Article>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Article>>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor) // Wstrzyknij accessor
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Result<List<Article>>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Pobieramy wszystkie artykuły bez filtrowania po użytkowniku
                var result = await _context.Articles
                    .Include(x => x.AppUser)
                    .ToListAsync(cancellationToken);

                return Result<List<Article>>.Success(result);
            }
        }

    }
}
