using MediatR;
using Articulum.Domain;
using Articulum.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Articulum.Application.Articles
{
    public class Details
    {
        public class Query : IRequest<Result<Article>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Article>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Article>> Handle(Query request, CancellationToken cancellationToken)
            {
                var article = await _context.Articles
                    .Include(x => x.AppUser)
                    .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

                if (article == null)
                    return Result<Article>.Failure("Nie znaleziono artykułu");

                return Result<Article>.Success(article);
            }
        }
    }
}