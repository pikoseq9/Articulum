using Books.Domain;
using Books.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.Application.Books
{
    public class Edit
    {
        public class Command : IRequest<Unit>
        {
            public required UserBook UserBook { get; set; }
        }

        public class Handler : IRequestHandler<Command, Unit>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var book = await _context.Books.FindAsync(request.UserBook.Id);


                book.Title = request.UserBook.Title ?? book.Title;
                book.Author = request.UserBook.Author ?? book.Author;
                book.Isbn = request.UserBook.Isbn ?? book.Isbn;
                book.ImageUrl = request.UserBook.ImageUrl ?? book.ImageUrl;
                book.Description = request.UserBook.Description ?? book.Description;


                book.Status = request.UserBook.Status;


                await _context.SaveChangesAsync();

                return Unit.Value;
            }

            public class CommandValidator : AbstractValidator<Command>
            {
                public CommandValidator()
                {
                    RuleFor(x => x.UserBook).SetValidator(new BooksValidator());
                }
            }
        }
    }
}