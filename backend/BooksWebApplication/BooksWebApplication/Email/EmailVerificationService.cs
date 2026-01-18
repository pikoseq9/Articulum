using Books.Domain;
using Books.Infrastructure;


public class EmailVerificationService
{
    private readonly DataContext _context;
    private readonly IEmailService _email;

    public EmailVerificationService(DataContext context, IEmailService email)
    {
        _context = context;
        _email = email;
    }

    public async Task SendCodeAsync(AppUser user)
    {
        var code = VerificationCodeGenerator.GenerateCode();
        var hash = VerificationCodeGenerator.Hash(code);

        var record = new EmailVerificationCode
        {
            UserId = user.Id,
            CodeHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            Used = false
        };

        _context.EmailVerificationCodes.Add(record);
        await _context.SaveChangesAsync();

        await _email.SendAsync(
            user.Email,
            "Cars – kod weryfikacyjny",
            $"<h2>Twój kod:</h2><h1>{code}</h1><p>Ważny 10 minut.</p>"
        );
    }
}
