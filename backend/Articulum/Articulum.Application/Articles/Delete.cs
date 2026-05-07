using Articulum.Application;
using Articulum.Domain;
using Articulum.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Articulum.Application.Articles
{
    public class Delete
    {
        //public class Command : IRequest<Result<Unit>>
        //{
        //    public required Guid Id { get; set; }
        //}

        //public class Handler : IRequestHandler<Command, Result<Unit>>
        //{
        //    private readonly DataContext _context;
        //    private readonly IUserAccessor _userAccessor;

        //    public Handler(DataContext context, IUserAccessor userAccessor)
        //    {
        //        _context = context;
        //        _userAccessor = userAccessor;
        //    }

        //    public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        //    {
        //        // Szukamy książki, która należy do zalogowanego użytkownika
        //        var book = await _context.Books
        //            .FirstOrDefaultAsync(x => x.Id == request.Id &&
        //                                      x.AppUser.UserName == _userAccessor.GetUsername(),
        //                                 cancellationToken);

        //        if (book == null)
        //            return Result<Unit>.Failure("Nie znaleziono książki lub brak uprawnień do usunięcia");

        //        _context.Remove(book);

        //        var result = await _context.SaveChangesAsync(cancellationToken) > 0;

        //        if (!result)
        //            return Result<Unit>.Failure("Nie udało się usunąć książki z bazy danych");

        //        return Result<Unit>.Success(Unit.Value);
        //    }
        //}
    }
}