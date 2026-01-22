using Books.Domain;
using Books.Infrastructure;
using BooksWebApplication.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BooksWebApplication;
using System.Security.Claims;
using Google.Authenticator;

namespace BooksWebApplication
{
    [Route("api/[controller]")]
    [ApiController]

    public class AccountController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService _tokenService;
        private readonly EmailVerificationService _emailVerificationService;
        private readonly IWebHostEnvironment _env;
        public AccountController(UserManager<AppUser> userManager, TokenService tokenService, EmailVerificationService emailVerificationService, IWebHostEnvironment env)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _emailVerificationService = emailVerificationService;
            _env = env;

        }
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null) return Unauthorized("Invalid email");

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!result) return Unauthorized("Invalid password");

            // LOGIKA MFA START
            if (user.TwoFactorEnabled)
            {
                if (user.TwoFactorMethod == "email")
                {
                    await _emailVerificationService.SendCodeAsync(user);
                }

                return new UserDto
                {
                    UserName = user.UserName,
                    DisplayName = user.DisplayName,
                    Token = "",
                    MyGoal =0,
                    IsMfaRequired = true,
                    IsMfaEnabled = true,
                    MfaMethod = user.TwoFactorMethod
                };
            }
            // LOGIKA MFA KONIEC

            return CreateUserObject(user);
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
            {
                return BadRequest("Email jest już zajęty");
            }

            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.UserName))
            {
                return BadRequest("Nazwa użytkownika jest już zajęta");
            }

            var user = new AppUser
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.UserName,
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return new UserDto
            {
                DisplayName = user.DisplayName,
                Token = _tokenService.CreateToken(user),
                UserName = user.UserName
            };
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            if (user == null)
            {
                return NotFound();
            }
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Token = _tokenService.CreateToken(user),
                UserName = user.UserName,
                MyGoal = user.MyGoal,
                Bio = user.Bio,
                IsMfaEnabled = user.TwoFactorEnabled
            }; 
        }


        [AllowAnonymous]
        [HttpPost("verify-mfa")]
        public async Task<ActionResult<UserDto>> VerifyMfa(MfaDto mfaDto, [FromServices] DataContext context)
        {
            var user = await _userManager.FindByEmailAsync(mfaDto.Email);
            if (user == null) return Unauthorized();

            bool isCorrect = false;

            if (user.TwoFactorMethod == "authenticator")
            {
                var tfa = new TwoFactorAuthenticator();
                isCorrect = tfa.ValidateTwoFactorPIN(user.TwoFactorSecret, mfaDto.Code);
            }
            else if (user.TwoFactorMethod == "email")
            {
                var hash = VerificationCodeGenerator.Hash(mfaDto.Code);
                var record = await context.EmailVerificationCodes
                    .Where(x => x.UserId == user.Id && !x.Used && x.ExpiresAt > DateTime.UtcNow)
                    .OrderByDescending(x => x.ExpiresAt)
                    .FirstOrDefaultAsync(x => x.CodeHash == hash);

                if (record != null)
                {
                    isCorrect = true;
                    record.Used = true;
                    await context.SaveChangesAsync();
                }
            }

            if (!isCorrect) return Unauthorized("Invalid MFA Code");

            return CreateUserObject(user);
        }

        [Authorize]
        [HttpPost("enable-mfa")]
        public async Task<ActionResult<object>> EnableMfa([FromQuery] string method, [FromServices] EmailVerificationService verificationService)
        {
            if (method != "authenticator" && method != "email")
                return BadRequest("Invalid MFA method");

            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            if (user == null) return Unauthorized();

            user.TwoFactorMethod = method; // "email" lub "authenticator"

            if (method == "authenticator")
            {
                if (string.IsNullOrEmpty(user.TwoFactorSecret))
                {
                    user.TwoFactorSecret = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10);
                }
                await _userManager.UpdateAsync(user);

                var tfa = new TwoFactorAuthenticator();
                var setupInfo = tfa.GenerateSetupCode("BooksApp", user.Email, user.TwoFactorSecret, false, 3);

                return Ok(new { QrCodeSetupImageUrl = setupInfo.QrCodeSetupImageUrl, ManualEntryKey = setupInfo.ManualEntryKey });
            }
            else // Email
            {
                await _userManager.UpdateAsync(user);
                await verificationService.SendCodeAsync(user); // Wyślij kod testowy do potwierdzenia
                return Ok(new { Message = "Wysłano kod potwierdzający na e-mail" });
            }
        }


        [AllowAnonymous]
        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail([FromServices] IEmailService emailService)
        {
            await emailService.SendAsync(
                "kacpersliwka@onet.pl",
                "Test Cars App",
                "<h1>Działa!</h1><p>SMTP poprawnie skonfigurowane 🚀</p>");

            return Ok("Email sent");
        }

        [AllowAnonymous]
        [HttpPost("send-email-code")]
        public async Task<IActionResult> SendEmailCode(
            [FromBody] SendEmailCodeDto dto, // Przyjmij email z frontendu
            [FromServices] EmailVerificationService verificationService,
            [FromServices] UserManager<AppUser> userManager)
        {
            var user = await userManager.FindByEmailAsync(dto.Email); // Znajdź użytkownika po mailu

            if (user == null) return BadRequest("Użytkownik nie istnieje");

            await verificationService.SendCodeAsync(user); // Wyślij kod

            return Ok("Kod został wysłany na email.");
        }

        [AllowAnonymous]
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(
            VerifyEmailDto dto,
            [FromServices] DataContext context,
            [FromServices] UserManager<AppUser> userManager)
        {
            // 1. Znajdź użytkownika po e-mailu z DTO
            var user = await userManager.FindByEmailAsync(dto.Email);

            if (user == null) return BadRequest("Użytkownik nie istnieje");

            var hash = VerificationCodeGenerator.Hash(dto.Code);

            // 2. Szukaj kodu dla konkretnego ID użytkownika
            var record = await context.EmailVerificationCodes
                .Where(x => x.UserId == user.Id && !x.Used && x.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(x => x.ExpiresAt)
                .FirstOrDefaultAsync(x => x.CodeHash == hash);

            if (record == null)
                return BadRequest("Invalid or expired code");

            // 3. Zapisz zmiany
            record.Used = true;
            user.EmailConfirmed = true;

            await context.SaveChangesAsync();
            await userManager.UpdateAsync(user);

            return Ok("Email verified 🎉");
        }


        [Authorize]
        [HttpPost("confirm-mfa-enable")]
        public async Task<ActionResult<UserDto>> ConfirmMfaEnable([FromBody] string code, [FromServices] DataContext context)
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            if (user == null) return Unauthorized();

            bool isCorrect = false;

            if (user.TwoFactorMethod == "authenticator")
            {
                isCorrect = new TwoFactorAuthenticator().ValidateTwoFactorPIN(user.TwoFactorSecret, code);
            }
            else
            {
                var hash = VerificationCodeGenerator.Hash(code);
                var record = await context.EmailVerificationCodes
                    .FirstOrDefaultAsync(x => x.UserId == user.Id && !x.Used && x.ExpiresAt > DateTime.UtcNow && x.CodeHash == hash);

                if (record != null)
                {
                    isCorrect = true;
                    record.Used = true;
                }
            }

            if (!isCorrect) return BadRequest("Invalid code. MFA not enabled.");

            user.TwoFactorEnabled = true;
            await _userManager.UpdateAsync(user);
            await context.SaveChangesAsync();

            return CreateUserObject(user);
        }
        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                UserName = user.UserName,
                Token = _tokenService.CreateToken(user),
                MyGoal = user.MyGoal,
                IsMfaRequired = false,
                Bio = user.Bio,
                IsMfaEnabled = user.TwoFactorEnabled,
                AvatarUrl = user.AvatarUrl
            };
        }

        [Authorize]
        [HttpPost("disable-mfa")]
        public async Task<IActionResult> DisableMfa(DisableMfaDto dto, [FromServices] DataContext context)
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            if (user == null) return Unauthorized();

            bool isCorrect = false;

            // Logika weryfikacji kodu przed wyłączeniem
            if (user.TwoFactorMethod == "authenticator")
            {
                isCorrect = new TwoFactorAuthenticator().ValidateTwoFactorPIN(user.TwoFactorSecret, dto.Code);
            }
            else if (user.TwoFactorMethod == "email")
            {

                var hash = VerificationCodeGenerator.Hash(dto.Code);
                var record = await context.EmailVerificationCodes
                    .FirstOrDefaultAsync(x => x.UserId == user.Id && !x.Used && x.ExpiresAt > DateTime.UtcNow && x.CodeHash == hash);
                if (record != null) { isCorrect = true; record.Used = true; }
            }

            if (!isCorrect) return BadRequest("Nieprawidłowy kod");

            // KLUCZOWE: Resetowanie pól w bazie
            user.TwoFactorEnabled = false;
            user.TwoFactorMethod = null;
            user.TwoFactorSecret = null;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest("Błąd podczas aktualizacji bazy");

            await context.SaveChangesAsync();
            return Ok(new { Message = "MFA zostało wyłączone" });
        }

        [Authorize]
        [HttpPost("send-disable-code")]
        public async Task<IActionResult> SendDisableCode([FromServices] EmailVerificationService verificationService)
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            if (user == null) return Unauthorized();

            // Wysyłamy kod tylko jeśli metodą MFA jest email
            if (user.TwoFactorMethod == "email")
            {
                await verificationService.SendCodeAsync(user);
                return Ok(new { Message = "Kod do wyłączenia MFA został wysłany." });
            }

            return Ok(new { Message = "Użyj kodu z aplikacji Authenticator." });
        }

        [AllowAnonymous]
        [HttpDelete("delete-user/{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            // 1. Znajdź użytkownika po e-mailu
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { Message = "Użytkownik nie istnieje" });

            // 2. Usuń użytkownika
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "Nie udało się usunąć użytkownika", Errors = result.Errors });
            }

            return Ok(new { Message = $"Użytkownik {email} został usunięty" });
        }

        [Authorize]
        [HttpPost("update-goal")]
        public async Task<ActionResult> UpdateGoal(UpdateGoalDto goalDto)
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));

            if (user == null) return Unauthorized();

            user.MyGoal = goalDto.NewGoal;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message = "Cel został zaktualizowany", goal = user.MyGoal });
            }

            return BadRequest("Wystąpił błąd podczas aktualizacji celu");
        }

        [Authorize]
        [HttpPut("update-bio")]
        public async Task<ActionResult<UserDto>> UpdateBio([FromBody] UpdateBioRequest request)
        {
            // 1. Spójne pobieranie użytkownika (po Emailu, tak jak w reszcie kontrolera)
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));

            if (user == null) return Unauthorized();

            // 2. Obsługa nulla (jeśli frontend wyśle null, traktujemy to jak wyczyszczenie bio)
            var newBio = request.Bio?.Trim() ?? string.Empty;

            // 3. Walidacja
            if (newBio.Length > 200)
                return BadRequest("Bio jest za długie (max 200 znaków).");

            // 4. Aktualizacja
            user.Bio = newBio;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded) return BadRequest(result.Errors);

            // 5. Zwracamy zaktualizowany, pełny obiekt użytkownika
            return CreateUserObject(user);
        }


        [Authorize]
        [HttpPost("upload-avatar")]
        public async Task<ActionResult<UserDto>> UploadAvatar(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("Brak pliku.");

                // Walidacja rozszerzenia
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest("Nieprawidłowy format pliku.");

                // Walidacja rozmiaru (np. max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest("Plik jest za duży (max 5MB).");

                var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
                if (user == null) return NotFound();

                var uploadsFolder = Path.Combine(_env.WebRootPath, "avatars");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);
                Console.WriteLine($"WebRootPath: {_env.WebRootPath}");

                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                user.AvatarUrl = $"/avatars/{uniqueFileName}";
                await _userManager.UpdateAsync(user);

                return CreateUserObject(user);
            }
            catch (Exception ex)
            {
                // Loguj szczegóły błędu
                Console.WriteLine($"Upload error: {ex.Message}");
                return StatusCode(500, $"Błąd serwera: {ex.Message}");
            }
        }


    }
}
