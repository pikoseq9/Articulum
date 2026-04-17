using Articulum.Domain;
using FluentValidation;

namespace Articulum.Application
{
    public class BooksValidator : AbstractValidator<UserBook>
    {
        public BooksValidator()
        {
            RuleFor(x => x.Title).NotEmpty().WithMessage("Tytuł jest wymagany");
            RuleFor(x => x.Author).NotEmpty().WithMessage("Autor jest wymagany");
            RuleFor(x => x.Isbn).NotEmpty().WithMessage("ISBN jest wymagany");
            RuleFor(x => x.AddedAt).NotEmpty().WithMessage("Data dodania jest wymagana");
            RuleFor(x => x.Status).IsInEnum().WithMessage("Nieprawidłowy status książki");

            RuleFor(x => x.Subject)
                .MaximumLength(100).WithMessage("Nazwa gatunku nie może przekraczać 100 znaków");

            RuleFor(x => x.Pages)
                .GreaterThan(0).When(x => x.Pages.HasValue)
                .WithMessage("Całkowita liczba stron musi być większa od 0");

            RuleFor(x => x.CurrentPage)
                .GreaterThanOrEqualTo(0).When(x => x.CurrentPage.HasValue)
                .WithMessage("Aktualna strona nie może być ujemna")
                .Must((book, currentPage) =>
                {
                    if (currentPage.HasValue && book.Pages.HasValue)
                    {
                        return currentPage <= book.Pages;
                    }
                    return true;
                })
                .WithMessage("Aktualna strona nie może być większa niż całkowita liczba stron książki");
        }
    }
}