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
    public class ListLatest
    {
        public class Query : IRequest<Result<List<Article>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Article>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) { _context = context; }

            public async Task<Result<List<Article>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var articles = await _context.Articles.ToListAsync(cancellationToken);

                if (!articles.Any())
                    return Result<List<Article>>.Success(new List<Article>());

                var maxYear = articles.Max(a => a.PublicationDate.Year);

                var latestArticles = articles
                    .Where(a => a.PublicationDate.Year == maxYear)
                    .OrderBy(a => a.Category)
                    .ThenByDescending(a => a.PublicationDate)
                    .ToList();

                return Result<List<Article>>.Success(latestArticles);
            }
        }
    }
}