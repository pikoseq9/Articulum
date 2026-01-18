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

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<UserBook>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var result = await _context.Books.ToListAsync();
                return Result<List<UserBook>>.Success(result);
            }
        }

    }
}
