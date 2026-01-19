using Books.Domain;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.ConstrainedExecution;
using System.Text;
using System.Threading.Tasks;

namespace Books.Application
{
    public class BooksValidator : AbstractValidator<UserBook>
    {
        public BooksValidator()
        {
            RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required");
            RuleFor(x => x.Author).NotEmpty().WithMessage("Author is required");
            RuleFor(x => x.Isbn).NotEmpty().WithMessage("Isbn is required");
            RuleFor(x => x.AddedAt).NotEmpty().WithMessage("Added date is required");
            RuleFor(x => x.Status).IsInEnum();
        }

    }
}
