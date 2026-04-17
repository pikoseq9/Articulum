using MediatR;
using Articulum.Domain;
using Articulum.Infrastructure;
using System.Net.Http.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Articulum.Application.Articles
{
    public class AddByIsbn
    {
        public class Command : IRequest<Result<UserBook>>
        {
            public required string Isbn { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<UserBook>>
        {
            private readonly DataContext _context;
            private readonly IHttpClientFactory _httpClientFactory;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IHttpClientFactory httpClientFactory, IUserAccessor userAccessor)
            {
                _context = context;
                _httpClientFactory = httpClientFactory;
                _userAccessor = userAccessor;
            }

            public async Task<Result<UserBook>> Handle(Command request, CancellationToken cancellationToken)
            {
                var client = _httpClientFactory.CreateClient();
                var url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{request.Isbn}&format=json&jscmd=data";

                Dictionary<string, OpenLibDto>? response;
                try
                {
                    response = await client.GetFromJsonAsync<Dictionary<string, OpenLibDto>>(url, cancellationToken);
                }
                catch (Exception)
                {
                    return Result<UserBook>.Failure("Błąd podczas połączenia z API OpenLibrary");
                }

                if (response == null || !response.ContainsKey($"ISBN:{request.Isbn}"))
                    return Result<UserBook>.Failure("Nie znaleziono książki o podanym numerze ISBN");

                var bookData = response[$"ISBN:{request.Isbn}"];

                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername(), cancellationToken);
                if (user == null) return Result<UserBook>.Failure("Nie znaleziono zalogowanego użytkownika");

                var book = new UserBook
                {
                    Id = Guid.NewGuid(),
                    Isbn = request.Isbn,
                    Title = bookData.Title,
                    AppUser = user,
                    AppUserId = user.Id,
                    Author = bookData.Authors != null
                        ? string.Join(", ", bookData.Authors.Select(x => x.Name))
                        : "Nieznany autor",
                    Pages = bookData.Number_of_pages,
                    ImageUrl = $"https://covers.openlibrary.org/b/isbn/{request.Isbn}-L.jpg",
                    Description = !string.IsNullOrEmpty(bookData.Notes) ? bookData.Notes : "Brak opisu",


                    Subject = bookData.Subjects != null
                        ? string.Join(", ", bookData.Subjects.Select(x => x.Name).Take(1))
                        : "Nieokreślony",

                    CurrentPage = 0,

                    Status = BookStatus.ToRead,
                    AddedAt = DateTime.UtcNow
                };

                _context.Books.Add(book);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                return success
                    ? Result<UserBook>.Success(book)
                    : Result<UserBook>.Failure("Wystąpił błąd podczas zapisywania książki w bazie danych");
            }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Isbn)
                    .NotEmpty().WithMessage("ISBN jest wymagany")
                    .Length(10, 13).WithMessage("ISBN musi mieć od 10 do 13 znaków");
            }
        }

        public class OpenLibDto
        {
            public string Title { get; set; } = string.Empty;
            public int? Number_of_pages { get; set; }
            public string? Notes { get; set; }
            public List<OpenLibAuthor>? Authors { get; set; }
            public List<OpenLibSubject>? Subjects { get; set; }
        }

        public class OpenLibAuthor
        {
            public string Name { get; set; } = string.Empty;
        }

        // Nowa klasa pomocnicza dla gatunków z API
        public class OpenLibSubject
        {
            public string Name { get; set; } = string.Empty;
        }
    }
}