using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Scaffold;

namespace V_Album_Server.Controllers;

public sealed record GoogleLoginRequest(string? GoogleIdToken);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    [HttpPost("login/google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"@@@ a {request}");

        if (string.IsNullOrWhiteSpace(request.GoogleIdToken))
            return BadRequest(new { error = "googleIdToken is required." });

        var clientId = _configuration["GoogleAuth:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { error = "GoogleAuth:ClientId is not configured." });
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.GoogleIdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId },
                });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { error = "Invalid Google ID token." });
        }

        var googleSub = payload.Subject;
        if (string.IsNullOrWhiteSpace(googleSub))
        {
            return Unauthorized(new { error = "Google subject(sub) was missing from token." });
        }

        var auth = await _dbContext.Auths
            .SingleOrDefaultAsync(a => a.GoogleSub == googleSub, cancellationToken);

        var isNewUser = false;
        if (auth is null)
        {
            auth = new Infrastructures.Persistence.Scaffold.Auth
            {
                UserUuid = Guid.NewGuid().ToString("N"),
                GoogleSub = googleSub,
            };

            _dbContext.Auths.Add(auth);

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
                isNewUser = true;
            }
            catch (DbUpdateException)
            {
                // 같은 googleSub로 동시 요청이 들어온 경우 unique 제약으로 실패할 수 있으므로 재조회
                auth = await _dbContext.Auths
                    .SingleAsync(a => a.GoogleSub == googleSub, cancellationToken);
                if (auth is null)
                {
                    return StatusCode(StatusCodes.Status409Conflict,
                        new { error = "Auth record creation conflicted, but existing record was not found." });
                }
            }
        }

        return Ok(new
        {
            userUuid = auth.UserUuid,
            googleSub = auth.GoogleSub,
            isNewUser,
        });
    }

}
