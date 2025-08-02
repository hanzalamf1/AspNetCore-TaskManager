using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskManagerApi.Models;
using BCrypt.Net;
using TaskManagerApi.Models.Data;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public class RegisterDto
        {
            public string Username { get; set; }
            public string Password { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
        }

        public class LoginDto
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        public class ChangePasswordDto
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }

        public class UpdateProfileDto
        {
            public string Username { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = string.Join(" ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.PhoneNumber))
                return BadRequest(new { success = false, message = "Kullanıcı adı, şifre, e-posta ve telefon zorunludur." });
            if (dto.Username.Length < 3)
                return BadRequest(new { success = false, message = "Kullanıcı adı en az 3 karakter olmalı." });
            if (dto.Password.Length < 6)
                return BadRequest(new { success = false, message = "Şifre en az 6 karakter olmalı." });
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return BadRequest(new { success = false, message = "Geçerli bir e-posta adresi giriniz." });
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.PhoneNumber, @"^\+?\d{10,15}$"))
                return BadRequest(new { success = false, message = "Geçerli bir telefon numarası giriniz." });

            var existingUser = await _context.Users
                .Where(u => u.Username == dto.Username || u.Email == dto.Email || u.PhoneNumber == dto.PhoneNumber)
                .Select(u => new { u.Username, u.Email, u.PhoneNumber })
                .FirstOrDefaultAsync();
            if (existingUser != null)
            {
                if (existingUser.Username == dto.Username)
                    return Conflict(new { success = false, message = "Bu kullanıcı adı zaten alınmış." });
                if (existingUser.Email == dto.Email)
                    return Conflict(new { success = false, message = "Bu e-posta zaten kayıtlı." });
                if (existingUser.PhoneNumber == dto.PhoneNumber)
                    return Conflict(new { success = false, message = "Bu telefon numarası zaten kayıtlı." });
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            // Make the first user admin
            bool isFirstUser = !_context.Users.Any();
            var newUser = new User { Username = dto.Username, PasswordHash = passwordHash, Email = dto.Email, PhoneNumber = dto.PhoneNumber };
            if (isFirstUser) newUser.Role = "admin";
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Kayıt başarılı. Lütfen giriş yapınız." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            if (string.IsNullOrWhiteSpace(login.Username) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });

            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == login.Username);
            if (dbUser == null)
                return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });

            if (!BCrypt.Net.BCrypt.Verify(login.Password, dbUser.PasswordHash))
                return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });

            // Kalan gün kontrolü
            if (dbUser.RemainingDays <= 0)
                return Unauthorized(new { message = "Erişim süreniz dolmuştur. Lütfen yöneticinizle iletişime geçin." });

            // Update last login
            dbUser.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(dbUser);
            return Ok(new { 
                token,
                user = new {
                    id = dbUser.Id,
                    username = dbUser.Username,
                    email = dbUser.Email,
                    remainingDays = dbUser.RemainingDays,
                    role = dbUser.Role
                }
            });
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            if (!int.TryParse(userIdClaim.Value, out int userId)) return Unauthorized();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();
            
            // RemainingDays decrement logic
            if (user.RemainingDays > 0)
            {
                var now = DateTime.UtcNow;
                if (!user.LastDecrementDate.HasValue || (now - user.LastDecrementDate.Value).TotalHours >= 24)
                {
                    user.RemainingDays -= 1;
                    user.LastDecrementDate = now;
                    await _context.SaveChangesAsync();
                }
            }
            
            return Ok(new {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                remainingDays = user.RemainingDays,
                createdAt = user.CreatedAt,
                lastLoginAt = user.LastLoginAt,
                role = user.Role // <-- rol bilgisini ekle
            });
        }

        [HttpPut("change-password")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "Mevcut şifre ve yeni şifre zorunludur." });

            if (dto.NewPassword.Length < 6)
                return BadRequest(new { message = "Yeni şifre en az 6 karakter olmalı." });

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            if (!int.TryParse(userIdClaim.Value, out int userId)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Mevcut şifre hatalı." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Şifre başarıyla değiştirildi." });
        }

        [HttpPut("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            if (!int.TryParse(userIdClaim.Value, out int userId)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            // Check if username is already taken by another user
            if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
            {
                if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                    return Conflict(new { message = "Bu kullanıcı adı zaten alınmış." });
                user.Username = dto.Username;
            }

            // Check if email is already taken by another user
            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                    return BadRequest(new { message = "Geçerli bir e-posta adresi giriniz." });
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                    return Conflict(new { message = "Bu e-posta zaten kayıtlı." });
                user.Email = dto.Email;
            }

            // Check if phone number is already taken by another user
            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber) && dto.PhoneNumber != user.PhoneNumber)
            {
                if (!System.Text.RegularExpressions.Regex.IsMatch(dto.PhoneNumber, @"^\+?\d{10,15}$"))
                    return BadRequest(new { message = "Geçerli bir telefon numarası giriniz." });
                if (await _context.Users.AnyAsync(u => u.PhoneNumber == dto.PhoneNumber))
                    return Conflict(new { message = "Bu telefon numarası zaten kayıtlı." });
                user.PhoneNumber = dto.PhoneNumber;
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Profil başarıyla güncellendi.",
                user = new {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    remainingDays = user.RemainingDays
                }
            });
        }

        [HttpDelete("delete-account")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            if (!int.TryParse(userIdClaim.Value, out int userId)) return Unauthorized();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Hesabınız başarıyla silindi." });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToLower()) // <-- admin rolü claim olarak eklendi
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(12),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 