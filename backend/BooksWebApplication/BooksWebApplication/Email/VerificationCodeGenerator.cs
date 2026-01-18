using System.Security.Cryptography;
using System.Text;

public static class VerificationCodeGenerator
{
    public static string GenerateCode()
    {
        return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
    }

    public static string Hash(string code)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(code);
        return Convert.ToBase64String(sha.ComputeHash(bytes));
    }
}
