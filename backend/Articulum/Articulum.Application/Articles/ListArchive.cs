using Articulum.Domain;
using Articulum.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Articulum.Application.Articles
{
    public class ListArchive
    {
        public class Query : IRequest<Result<List<Article>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Article>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) { _context = context; }

            public async Task<Result<List<Article>>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Pobieramy artykuły od razu posortowane z bazy danych, włączając w to obecny rok
                var archiveArticles = await _context.Articles
                    .OrderByDescending(a => a.PublicationDate)
                    .ToListAsync(cancellationToken);

                return Result<List<Article>>.Success(archiveArticles);
            }
        }
    }
}