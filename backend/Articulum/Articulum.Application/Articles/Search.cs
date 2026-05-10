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
    public class Search
    {
        public class Query : IRequest<Result<List<Article>>>
        {
            public string SearchTerm { get; set; } = string.Empty;
        }

        public class Handler : IRequestHandler<Query, Result<List<Article>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) { _context = context; }

            public async Task<Result<List<Article>>> Handle(Query request, CancellationToken cancellationToken)
            {
                if (string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    return Result<List<Article>>.Success(new List<Article>());
                }

                var lowerTerm = request.SearchTerm.ToLower();

                var articles = await _context.Articles
                     .Where(a => a.Title.ToLower().Contains(lowerTerm) ||
                                 a.Authors.ToLower().Contains(lowerTerm) ||
                                 (!string.IsNullOrEmpty(a.Keywords) && a.Keywords.ToLower().Contains(lowerTerm)))
                     .ToListAsync(cancellationToken);

                return Result<List<Article>>.Success(articles);
            }
        }
    }
}