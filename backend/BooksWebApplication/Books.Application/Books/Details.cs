using System;
using System.Collections.Generic;
using MediatR;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Books.Domain;
using Books.Infrastructure;
using System.Runtime.ConstrainedExecution;

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
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<UserBook>> Handle(Query request, CancellationToken cancellationToken)
            {
                var UserBook = await _context.Books.FindAsync(request.Id);
                return Result<UserBook>.Success(UserBook);
            }
        }
    }
}
